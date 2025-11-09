import { useState, useRef, useCallback } from "react";

const useNotification = () => {
  const [notification, setNotification] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const notificationSound = useRef(null);
  const audioContext = useRef(null);
  const soundBuffer = useRef(null);

  // Initialize Audio with multiple fallback methods
  const initializeAudio = useCallback(() => {
    if (!notificationSound.current) {
      notificationSound.current = new Audio("/notification/notification.mp3");
      notificationSound.current.preload = "auto";
      notificationSound.current.load();
    }

    // Also prepare Web Audio API as fallback
    if (!audioContext.current && (window.AudioContext || window.webkitAudioContext)) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Unlock audio (call this on first user interaction)
  const prepareSound = useCallback(() => {
    initializeAudio();

    // Method 1: HTML5 Audio unlock
    const unlockAudio = () => {
      if (notificationSound.current) {
        notificationSound.current.play()
          .then(() => {
            notificationSound.current.pause();
            notificationSound.current.currentTime = 0;
            setSoundEnabled(true);
            console.log("🔓 HTML5 Audio unlocked!");
          })
          .catch(err => console.warn("HTML5 Audio unlock failed:", err));
      }
    };

    // Method 2: Web Audio API unlock
    const unlockWebAudio = () => {
      if (audioContext.current && audioContext.current.state === 'suspended') {
        audioContext.current.resume()
          .then(() => {
            console.log("🔓 Web Audio API unlocked!");
            
            // Load audio buffer for future use
            fetch("/notification/notification.mp3")
              .then(response => response.arrayBuffer())
              .then(arrayBuffer => audioContext.current.decodeAudioData(arrayBuffer))
              .then(buffer => {
                soundBuffer.current = buffer;
                console.log("🔊 Audio buffer loaded!");
              })
              .catch(err => console.warn("Buffer load failed:", err));
          })
          .catch(err => console.warn("Web Audio unlock failed:", err));
      }
    };

    unlockAudio();
    unlockWebAudio();

    // Remove listeners after first unlock
    document.removeEventListener('click', prepareSound);
    document.removeEventListener('touchstart', prepareSound);
    document.removeEventListener('keydown', prepareSound);
  }, [initializeAudio]);

  // Play sound with multiple fallback methods
  const playSound = useCallback(() => {
    // Method 1: Try HTML5 Audio
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play()
        .then(() => {
          console.log("🔊 Sound played via HTML5 Audio");
        })
        .catch(err => {
          console.warn("HTML5 Audio failed, trying Web Audio API:", err);
          
          // Method 2: Fallback to Web Audio API
          if (audioContext.current && soundBuffer.current) {
            try {
              const source = audioContext.current.createBufferSource();
              source.buffer = soundBuffer.current;
              source.connect(audioContext.current.destination);
              source.start(0);
              console.log("🔊 Sound played via Web Audio API");
            } catch (webAudioErr) {
              console.warn("Web Audio API also failed:", webAudioErr);
            }
          }
        });
    }
  }, []);

  // Show notification with sound
  const notify = useCallback((message, duration = 5000) => {
    setNotification(message);

    // Play sound
    playSound();

    // Also try browser notification API if permitted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("New Order!", {
        body: message,
        icon: "/logo.png",
        badge: "/logo.png",
        tag: "order-notification",
        requireInteraction: false,
      });
    }

    // Auto-clear notification
    if (duration) {
      setTimeout(() => setNotification(null), duration);
    }
  }, [playSound]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
        return permission === "granted";
      } catch (err) {
        console.warn("Notification permission error:", err);
        return false;
      }
    }
    return Notification.permission === "granted";
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Initialize on mount
  useState(() => {
    initializeAudio();
    
    // Auto-attach unlock listeners
    const attachUnlockListeners = () => {
      document.addEventListener('click', prepareSound, { once: false });
      document.addEventListener('touchstart', prepareSound, { once: false });
      document.addEventListener('keydown', prepareSound, { once: false });
    };

    attachUnlockListeners();

    return () => {
      document.removeEventListener('click', prepareSound);
      document.removeEventListener('touchstart', prepareSound);
      document.removeEventListener('keydown', prepareSound);
    };
  });

  return {
    notification,
    notify,
    clearNotification,
    prepareSound,
    requestNotificationPermission,
    soundEnabled,
  };
};

export default useNotification;