import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => (
  <div className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring' }}
      className="font-display text-[8rem] font-bold leading-none text-brand-green md:text-[12rem]"
    >
      404
    </motion.div>
    <h1 className="font-display text-2xl font-bold md:text-3xl">
      Page Not Found
    </h1>
    <p className="mt-2 text-gray-500">
      Looks like you've ventured into uncharted territory
    </p>
    <Link to="/" className="btn-primary mt-6">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
