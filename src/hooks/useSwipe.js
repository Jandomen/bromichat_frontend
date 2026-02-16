import { useState, useEffect } from 'react';

export const useSwipe = (onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // min swipe distance
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const onTouchMove = (e) => {
        setTouchEnd({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distanceX = touchStart.x - touchEnd.x;
        const distanceY = touchStart.y - touchEnd.y;
        const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontalSwipe) {
            if (Math.abs(distanceX) > minSwipeDistance) {
                if (distanceX > 0) {
                    onSwipeLeft && onSwipeLeft();
                } else {
                    onSwipeRight && onSwipeRight();
                }
            }
        } else {
            if (Math.abs(distanceY) > minSwipeDistance) {
                if (distanceY > 0) {
                    onSwipeUp && onSwipeUp();
                } else {
                    onSwipeDown && onSwipeDown();
                }
            }
        }
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};
