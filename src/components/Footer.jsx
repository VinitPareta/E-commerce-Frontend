import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';

const Footer = () => (
  <footer className="mt-20 border-t border-gray-200/60 bg-brand-pink-soft/40 dark:bg-brand-black-soft dark:border-white/10">
    <div className="container-app py-12">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-pink to-brand-pink-dark text-sm font-extrabold text-white shadow-soft">
              DS
            </div>
            <span className="font-display text-2xl font-bold">DS Store</span>
          </Link>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Premium fashion for boys and girls. Discover curated collections
            with love.
          </p>
          <div className="mt-4 flex gap-3">
            {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card transition hover:bg-brand-pink hover:text-white dark:bg-brand-black"
                aria-label="social"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link to="/shop?category=Men" className="hover:text-brand-pink">
                Men
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Women" className="hover:text-brand-pink">
                Women
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=Accessories"
                className="hover:text-brand-pink"
              >
                Accessories
              </Link>
            </li>
            <li>
              <Link to="/shop?trending=true" className="hover:text-brand-pink">
                Trending
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Help</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="#" className="hover:text-brand-pink">Shipping</a></li>
            <li><a href="#" className="hover:text-brand-pink">Returns</a></li>
            <li><a href="#" className="hover:text-brand-pink">FAQ</a></li>
            <li><a href="#" className="hover:text-brand-pink">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Newsletter</h4>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            Get 10% off your first order
          </p>
          <form className="flex gap-2">
            <input type="email" placeholder="Email address" className="input" />
            <button type="submit" className="btn-primary">Join</button>
          </form>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-gray-200/60 pt-6 text-sm text-gray-500 md:flex-row dark:border-white/10">
        <p>© {new Date().getFullYear()} DS Store. All rights reserved.</p>
        <p>Made with love in Pink, White & Black</p>
      </div>
    </div>
  </footer>
);

export default Footer;
