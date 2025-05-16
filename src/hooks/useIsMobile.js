import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

const useIsMobile = () => {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? isMobile : false;
};

export default useIsMobile;
