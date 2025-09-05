import { supabase } from '@/utils/supabase';
import { ValidationUtils } from '@/utils/validation';
import { logger } from '@/utils/logger';
import {
  Chat,
  Message,
  ApiResponse
} from '@/types';

export class ChatService {
  /**
   * Create or find existing chat between traveler and local
   */
  static async findOrCreateChat(
    travelerId: string,
    localId: string,
    city: string
  ): Promise<ApiResponse<Chat>> {
    try {
      // Check if chat already exists between these users
      const { data: existingChat, error: findError } = await supabase
        .from('chats')
        .select('*')
        .or(`and(traveler_id.eq.${travelerId},local_id.eq.${localId}),and(traveler_id.eq.${localId},local_id.eq.${travelerId})`)
        .eq('status', 'active')
        .single();

      if (existingChat && !findError) {
        return {
          success: true,
          data: existingChat
        };
      }

      // Validate that the local user actually exists and is a local
      const { data: localUser, error: localError } = await supabase
        .from('profiles')
        .select('id, is_local')
        .eq('id', localId)
        .eq('is_local', true)
        .single();

      if (localError || !localUser) {
        return {
          success: false,
          error: 'Local expert not found'
        };
      }

      // Validate that the traveler exists
      const { data: travelerUser, error: travelerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', travelerId)
        .single();

      if (travelerError || !travelerUser) {
        return {
          success: false,
          error: 'Traveler not found'
        };
      }

      // Create new chat
      const chatData = {
        traveler_id: travelerId,
        local_id: localId,
        city: ValidationUtils.sanitizeString(city),
        status: 'active' as const,
        last_message_at: new Date().toISOString()
      };

      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([chatData])
        .select()
        .single();

      if (createError || !newChat) {
        logger.error('Chat creation error:', createError);
        return {
          success: false,
          error: 'Failed to create chat'
        };
      }

      // Create chat participants
      const participants = [
        {
          chat_id: newChat.id,
          user_id: travelerId,
          role: 'traveler' as const,
          joined_at: new Date().toISOString()
        },
        {
          chat_id: newChat.id,
          user_id: localId,
          role: 'local' as const,
          joined_at: new Date().toISOString()
        }
      ];

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) {
        logger.error('Chat participants creation error:', participantsError);
        // Clean up chat if participants creation fails
        await supabase.from('chats').delete().eq('id', newChat.id);
        return {
          success: false,
          error: 'Failed to setup chat participants'
        };
      }

      logger.info(`Chat created between traveler ${travelerId} and local ${localId}`, {
        chatId: newChat.id,
        city
      });

      return {
        success: true,
        data: newChat
      };

    } catch (error) {
      logger.error('Find or create chat service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Get user's chats
   */
  static async getUserChats(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          id,
          traveler_id,
          local_id,
          city,
          status,
          last_message_at,
          created_at,
          traveler:profiles!chats_traveler_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          local:profiles!chats_local_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          messages (
            id,
            content,
            sender_id,
            created_at,
            is_read
          )
        `)
        .or(`traveler_id.eq.${userId},local_id.eq.${userId}`)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
        logger.error('Get user chats error:', error);
        return {
          success: false,
          error: 'Failed to fetch chats'
        };
      }

      // Transform chat data to include last message and unread count
      const transformedChats = chats?.map(chat => {
        const isUserTraveler = chat.traveler_id === userId;
        const otherUser = isUserTraveler ? chat.local : chat.traveler;
        const lastMessage = chat.messages?.[0];
        const unreadCount = chat.messages?.filter(msg => 
          !msg.is_read && msg.sender_id !== userId
        ).length || 0;

        return {
          id: chat.id,
          city: chat.city,
          status: chat.status,
          last_message_at: chat.last_message_at,
          created_at: chat.created_at,
          other_user: otherUser,
          user_role: isUserTraveler ? 'traveler' : 'local',
          last_message: lastMessage ? {
            id: lastMessage.id,
            content: lastMessage.content,
            sender_id: lastMessage.sender_id,
            created_at: lastMessage.created_at,
            is_from_user: lastMessage.sender_id === userId
          } : null,
          unread_count: unreadCount
        };
      }) || [];

      return {
        success: true,
        data: transformedChats
      };

    } catch (error) {
      logger.error('Get user chats service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Get chat messages
   */
  static async getChatMessages(
    chatId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<Message[]>> {
    try {
      // Verify user is participant in this chat
      const { data: participant, error: participantError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();

      if (participantError || !participant) {
        return {
          success: false,
          error: 'Access denied to this chat'
        };
      }

      const { page: validPage, limit: validLimit } = ValidationUtils.validatePagination(page, limit);
      const offset = (validPage - 1) * validLimit;

      const { data: messages, error, count } = await supabase
        .from('messages')
        .select(`
          id,
          chat_id,
          sender_id,
          content,
          message_type,
          is_read,
          created_at,
          sender:profiles!messages_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + validLimit - 1);

      if (error) {
        logger.error('Get chat messages error:', error);
        return {
          success: false,
          error: 'Failed to fetch messages'
        };
      }

      return {
        success: true,
        data: messages || [],
        pagination: {
          page: validPage,
          limit: validLimit,
          total: count || 0,
          pages: Math.ceil((count || 0) / validLimit)
        }
      };

    } catch (error) {
      logger.error('Get chat messages service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Send message
   */
  static async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'location' = 'text'
  ): Promise<ApiResponse<Message>> {
    try {
      // Verify user is participant in this chat
      const { data: participant, error: participantError } = await supabase
        .from('chat_participants')
        .select('role')
        .eq('chat_id', chatId)
        .eq('user_id', senderId)
        .single();

      if (participantError || !participant) {
        return {
          success: false,
          error: 'Access denied to this chat'
        };
      }

      // Validate message content
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          error: 'Message content cannot be empty'
        };
      }

      if (content.length > 1000) {
        return {
          success: false,
          error: 'Message content too long'
        };
      }

      // Create message
      const messageData = {
        chat_id: chatId,
        sender_id: senderId,
        content: ValidationUtils.sanitizeString(content),
        message_type: messageType,
        is_read: false
      };

      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          id,
          chat_id,
          sender_id,
          content,
          message_type,
          is_read,
          created_at
        `)
        .single();

      if (messageError || !message) {
        logger.error('Send message error:', messageError);
        return {
          success: false,
          error: 'Failed to send message'
        };
      }

      // Update chat's last message timestamp
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      logger.info(`Message sent in chat ${chatId} by user ${senderId}`);

      return {
        success: true,
        data: message
      };

    } catch (error) {
      logger.error('Send message service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(
    chatId: string,
    userId: string,
    messageIds: string[]
  ): Promise<ApiResponse<boolean>> {
    try {
      // Verify user is participant in this chat
      const { data: participant, error: participantError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();

      if (participantError || !participant) {
        return {
          success: false,
          error: 'Access denied to this chat'
        };
      }

      // Mark messages as read (only messages not sent by the user)
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', userId)
        .in('id', messageIds);

      if (error) {
        logger.error('Mark messages as read error:', error);
        return {
          success: false,
          error: 'Failed to mark messages as read'
        };
      }

      return {
        success: true,
        data: true
      };

    } catch (error) {
      logger.error('Mark messages as read service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Archive chat
   */
  static async archiveChat(chatId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Verify user is participant in this chat
      const { data: participant, error: participantError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();

      if (participantError || !participant) {
        return {
          success: false,
          error: 'Access denied to this chat'
        };
      }

      // Archive the chat
      const { error } = await supabase
        .from('chats')
        .update({ status: 'archived' })
        .eq('id', chatId);

      if (error) {
        logger.error('Archive chat error:', error);
        return {
          success: false,
          error: 'Failed to archive chat'
        };
      }

      logger.info(`Chat ${chatId} archived by user ${userId}`);

      return {
        success: true,
        data: true
      };

    } catch (error) {
      logger.error('Archive chat service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }
}