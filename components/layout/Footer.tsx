import Link from 'next/link'
import { ROUTES } from '../../utils/constants'

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto">
      <div className="container-grid section-spacing-md">
        <div className="grid-cards">
          {/* About LocalGuide */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">About LocalGuide</h3>
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Connect travelers with vetted locals for authentic experiences and personalized recommendations.
            </p>
            <p className="text-xs text-neutral-500">
              © 2024 LocalGuide. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Links</h3>
            <nav className="space-y-3">
              <Link 
                href={ROUTES.EXPLORE}
                className="block text-sm text-neutral-600 hover:text-primary-500 transition-colors"
              >
                Explore Destinations
              </Link>
              <Link 
                href={ROUTES.JOIN}
                className="block text-sm text-neutral-600 hover:text-primary-500 transition-colors"
              >
                Join LocalGuide
              </Link>
              <Link 
                href={ROUTES.LOGIN}
                className="block text-sm text-neutral-600 hover:text-primary-500 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href={ROUTES.FEEDBACK}
                className="block text-sm text-neutral-600 hover:text-primary-500 transition-colors"
              >
                Send Feedback
              </Link>
            </nav>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <p className="text-sm text-neutral-600">
                Need help or have questions?
              </p>
              <div className="space-y-2">
                <Link 
                  href={ROUTES.FEEDBACK}
                  className="block text-sm text-neutral-600 hover:text-primary-500 transition-colors"
                >
                  Support & Help
                </Link>
                <a 
                  href="mailto:hello@localguide.com" 
                  className="block text-sm text-neutral-600 hover:text-primary-500 transition-colors"
                >
                  hello@localguide.com
                </a>
              </div>
              <div className="flex space-x-4 pt-2">
                <a 
                  href="#" 
                  className="text-neutral-400 hover:text-primary-500 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="text-neutral-400 hover:text-primary-500 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.988-5.367 11.988-11.988C24.005 5.367 18.638.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.229 14.794 3.78 13.644 3.78 12.348c0-1.297.449-2.448 1.346-3.323.897-.875 2.026-1.297 3.323-1.297s2.448.422 3.323 1.297c.875.875 1.297 2.026 1.297 3.323 0 1.296-.422 2.446-1.297 3.321-.875.897-2.026 1.346-3.323 1.346zm7.74 0c-1.297 0-2.448-.49-3.323-1.297-.875-.875-1.297-2.025-1.297-3.321 0-1.297.422-2.448 1.297-3.323.875-.875 2.026-1.297 3.323-1.297s2.448.422 3.323 1.297c.875.875 1.297 2.026 1.297 3.323 0 1.296-.422 2.446-1.297 3.321-.875.897-2.026 1.346-3.323 1.346z" clipRule="evenodd"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="text-neutral-400 hover:text-primary-500 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}