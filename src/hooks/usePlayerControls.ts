import { useEffect, useRef, useCallback } from 'react';
import { sound } from '../audio/soundEngine';

export interface ControlKeys {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  action: boolean;
  jump: boolean;
  sprint: boolean;
}

interface UsePlayerControlsProps {
  canDeliver: boolean;
  onDeliver: () => void;
  onToggleVehicle: () => void;
}

export const usePlayerControls = ({
  canDeliver,
  onDeliver,
  onToggleVehicle
}: UsePlayerControlsProps) => {
  const keysRef = useRef<ControlKeys>({
    up: false,
    down: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false,
    action: false,
    jump: false,
    sprint: false
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }
    sound.init();
    const k = e.key.toLowerCase();
    const keys = keysRef.current;

    if (k === 'w' || k === 'arrowup') {
      keys.up = true;
      e.preventDefault();
    }
    if (k === 's' || k === 'arrowdown') {
      keys.down = true;
      e.preventDefault();
    }
    if (k === 'a') {
      keys.left = true;
      e.preventDefault();
    }
    if (k === 'd') {
      keys.right = true;
      e.preventDefault();
    }
    if (k === 'arrowleft' || k === 'q') {
      keys.turnLeft = true;
      keys.left = true;
      e.preventDefault();
    }
    if (k === 'arrowright') {
      keys.turnRight = true;
      keys.right = true;
      e.preventDefault();
    }
    if (k === ' ' || e.code === 'Space') {
      keys.action = true;
      keys.jump = true;
      e.preventDefault();
      if (canDeliver) onDeliver();
    }
    if (k === 'shift' || e.shiftKey) {
      keys.sprint = true;
    }
    if (k === 'e' || k === 'f') {
      e.preventDefault();
      onToggleVehicle();
    }
  }, [canDeliver, onDeliver, onToggleVehicle]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const keys = keysRef.current;

    if (k === 'w' || k === 'arrowup') keys.up = false;
    if (k === 's' || k === 'arrowdown') keys.down = false;
    if (k === 'a') keys.left = false;
    if (k === 'd') keys.right = false;
    if (k === 'arrowleft' || k === 'q') {
      keys.turnLeft = false;
      keys.left = false;
    }
    if (k === 'arrowright') {
      keys.turnRight = false;
      keys.right = false;
    }
    if (k === ' ' || e.code === 'Space') {
      keys.action = false;
      keys.jump = false;
    }
    if (k === 'shift' || !e.shiftKey) keys.sprint = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const setVirtualKey = (key: keyof ControlKeys, pressed: boolean) => {
    sound.init();
    keysRef.current[key] = pressed;
    if (key === 'action' && pressed && canDeliver) {
      onDeliver();
    }
  };

  return {
    keysRef,
    setVirtualKey
  };
};
