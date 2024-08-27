import { useEffect, useState } from "react";

export const useInitialRender = () => {
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => setIsInitialRender(false), []);

  return isInitialRender;
};
