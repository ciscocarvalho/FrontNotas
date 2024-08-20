import { useEffect, useState } from "react";

export const useInitialRender = () => {
    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(() => {
        if (isInitialRender) {
            setIsInitialRender(false);
        }
    }, []);

    return isInitialRender;
};
