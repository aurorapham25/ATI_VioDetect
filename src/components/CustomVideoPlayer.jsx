import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

import {
  PiEye,
  PiEyeClosed,
  PiPlay,
  PiPause,
  PiSkipBack,
  PiSkipForward,
} from "react-icons/pi";

// export default function CustomVideoPlayer({ src, violentTimestamps }) {
//   const videoRef = useRef(null);
//   const progressRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isBlurred, setIsBlurred] = useState(true);
//   const [progress, setProgress] = useState(0);
//   const [duration, setDuration] = useState(0);

//   const togglePlay = () => {
//     if (isPlaying) {
//       videoRef.current.pause();
//     } else {
//       videoRef.current.play();
//     }
//     setIsPlaying(!isPlaying);
//   };

//   const handleTimeUpdate = () => {
//     const video = videoRef.current;
//     setProgress(video.currentTime);
//     const isViolentMoment = violentTimestamps.some(
//       (ts) => video.currentTime >= ts.time && video.currentTime < ts.time + 1
//     );
//     if (isViolentMoment) {
//       setIsBlurred(true);
//     }
//   };

//   const handleSeek = (e) => {
//     const progressRect = progressRef.current.getBoundingClientRect();
//     const seekPosition = (e.clientX - progressRect.left) / progressRect.width;
//     videoRef.current.currentTime = seekPosition * duration;
//   };

//   const skip = (seconds) => {
//     videoRef.current.currentTime += seconds;
//   };

//   useEffect(() => {
//     const video = videoRef.current;
//     video.addEventListener("loadedmetadata", () => setDuration(video.duration));
//     return () => {
//       video.removeEventListener("loadedmetadata", () =>
//         setDuration(video.duration)
//       );
//     };
//   }, []);

//   return (
//     <div className="bg-white rounded-lg overflow-hidden shadow-xl">
//       <video
//         ref={videoRef}
//         src={src}
//         onTimeUpdate={handleTimeUpdate}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         className={`w-full aspect-video transition-all duration-300 ${
//           isBlurred ? "filter blur-md" : ""
//         }`}
//       />
//       <div className="p-4 space-y-2">
//         <div
//           ref={progressRef}
//           onClick={handleSeek}
//           className="w-full h-2 bg-slate-500/50 rounded-full cursor-pointer"
//         >
//           <div
//             style={{ width: `${(progress / duration) * 100}%` }}
//             className="h-full bg-violet-500 rounded-full"
//           ></div>
//         </div>
//         <div className="flex items-center justify-between text-slate-950">
//           <button
//             onClick={() => setIsBlurred(!isBlurred)}
//             className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-violet-200 transition-colors"
//           >
//             {isBlurred ? <PiEyeClosed /> : <PiEye />}
//             {isBlurred ? "Reveal" : "Blur"}
//           </button>
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => skip(-5)}
//               className="p-2 rounded-full hover:bg-violet-200 transition-colors"
//             >
//               <PiSkipBack />
//             </button>
//             <button
//               onClick={togglePlay}
//               className="p-2 rounded-full hover:bg-violet-200 transition-colors"
//             >
//               {isPlaying ? (
//                 <PiPause className="w-8 h-8" />
//               ) : (
//                 <PiPlay className="w-8 h-8" />
//               )}
//             </button>
//             <button
//               onClick={() => skip(5)}
//               className="p-2 rounded-full hover:bg-violet-200 transition-colors"
//             >
//               <PiSkipForward />
//             </button>
//           </div>
//           <div>
//             {new Date(progress * 1000).toISOString().substr(14, 5)} /{" "}
//             {new Date(duration * 1000).toISOString().substr(14, 5)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

const CustomVideoPlayer = forwardRef(({ src, violentTimestamps }, ref) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlurred, setIsBlurred] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    setProgress(video.currentTime);
    const isViolentMoment = violentTimestamps.some(
      (ts) => video.currentTime >= ts.time && video.currentTime < ts.time + 1
    );
    if (isViolentMoment) setIsBlurred(true);
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const seekPosition = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = seekPosition * duration;
  };

  const skip = (seconds) => {
    videoRef.current.currentTime += seconds;
  };

  useEffect(() => {
    const video = videoRef.current;
    const updateDuration = () => setDuration(video.duration);
    video.addEventListener("loadedmetadata", updateDuration);
    return () => video.removeEventListener("loadedmetadata", updateDuration);
  }, []);

  // ✅ expose control functions to parent
  useImperativeHandle(ref, () => ({
    seekTo: (timeInSeconds) => {
      if (videoRef.current) {
        videoRef.current.currentTime = timeInSeconds;
        videoRef.current.play();
        setIsPlaying(true);
      }
    },
  }));

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl">
      <video
        ref={videoRef}
        src={src}
        onError={() => alert("This video format is not supported.")}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={`w-full aspect-video transition-all duration-300 ${
          isBlurred ? "filter blur-md" : ""
        }`}
      />
      <div className="p-4 space-y-2">
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="w-full h-2 bg-slate-500/50 rounded-full cursor-pointer"
        >
          <div
            style={{ width: `${(progress / duration) * 100}%` }}
            className="h-full bg-violet-500 rounded-full"
          ></div>
        </div>
        <div className="flex items-center justify-between text-slate-950">
          <button
            onClick={() => setIsBlurred(!isBlurred)}
            className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-violet-200 transition-colors"
          >
            {isBlurred ? <PiEyeClosed /> : <PiEye />}
            {isBlurred ? "Reveal" : "Blur"}
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => skip(-5)}
              className="p-2 rounded-full hover:bg-violet-200 transition-colors"
            >
              <PiSkipBack />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 rounded-full hover:bg-violet-200 transition-colors"
            >
              {isPlaying ? (
                <PiPause className="w-8 h-8" />
              ) : (
                <PiPlay className="w-8 h-8" />
              )}
            </button>
            <button
              onClick={() => skip(5)}
              className="p-2 rounded-full hover:bg-violet-200 transition-colors"
            >
              <PiSkipForward />
            </button>
          </div>
          <div>
            {new Date(progress * 1000).toISOString().substr(14, 5)} /{" "}
            {new Date(duration * 1000).toISOString().substr(14, 5)}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CustomVideoPlayer;
