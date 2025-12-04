import { Link } from "react-router-dom";
import footerLogo from "@/assets/footer-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-primary-foreground">
          {/* Description */}
          <div className="lg:col-span-1">
            <p className="text-sm leading-relaxed opacity-90">
              Step into Geena Thai Massage, where ancient Southeast Asian wellness traditions meet modern luxury.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-1">
            <nav className="flex flex-col space-y-2">
              <Link to="/packages" className="text-sm uppercase tracking-wider hover:opacity-80 transition-opacity underline underline-offset-4">
                Treatments
              </Link>
              <Link to="/" className="text-sm uppercase tracking-wider hover:opacity-80 transition-opacity underline underline-offset-4">
                About Us
              </Link>
              <Link to="/booking" className="text-sm uppercase tracking-wider hover:opacity-80 transition-opacity underline underline-offset-4">
                Book Now
              </Link>
              <a href="mailto:geenathaimassage@gmail.com" className="text-sm uppercase tracking-wider hover:opacity-80 transition-opacity underline underline-offset-4">
                Contact Us
              </a>
            </nav>
          </div>

          {/* Location */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-light mb-3 opacity-70">Location</h4>
            <p className="text-sm leading-relaxed">
              1412 Cameron Road, Greerton, Tauranga 3142
            </p>
            <a 
              href="tel:0225396414" 
              className="text-sm underline underline-offset-4 hover:opacity-80 transition-opacity mt-2 inline-block"
            >
              Tel. 022 539 6414
            </a>
            <a 
              href="mailto:geenathaimassage@gmail.com" 
              className="text-sm underline underline-offset-4 hover:opacity-80 transition-opacity mt-1 inline-block"
            >
              geenathaimassage@gmail.com
            </a>
          </div>

          {/* Hours */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-light mb-3 opacity-70">Hours</h4>
            <p className="text-sm">Wednesday – Sunday</p>
            <p className="text-sm">9am – 9pm</p>
          </div>

          {/* Social */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-light mb-3 opacity-70">Follow</h4>
            <div className="flex flex-col space-y-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                Facebook
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Logo and Copyright */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <img 
            src={footerLogo} 
            alt="Geena Thai Massage Logo" 
            className="w-16 h-16 object-contain"
          />
          <p className="text-primary-foreground text-sm opacity-70">
            © {new Date().getFullYear()} Geena Thai Massage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
