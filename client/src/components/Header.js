import React, { useEffect, useState } from 'react';
import TopBar from './TopBar';
import Navbar from './Navbar';

const Header = () => {
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsShrunk(window.scrollY > 80);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        {!isShrunk && <TopBar />}
        <Navbar isShrunk={isShrunk} />
      </div>
      <div className={`${isShrunk ? 'h-[80px]' : 'h-[122px]'} transition-all duration-200`} />
    </>
  );
};

export default Header;
