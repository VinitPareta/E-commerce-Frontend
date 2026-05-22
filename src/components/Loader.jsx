const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4',
  };
  const spinner = (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-brand-green border-t-transparent`}
    />
  );
  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {spinner}
      </div>
    );
  }
  return <div className="flex items-center justify-center py-6">{spinner}</div>;
};

export default Loader;
