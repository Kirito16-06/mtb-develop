'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function StreakDisplay() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await axios.get(`/api/login-streak/userStreak`);
      return res.data;
    }
  });

  if (isLoading) return null; // Don't show anything while loading
  if (error) return null; // Don't show anything if there's an error
  
  const streakCount = data?.streak?.currentStreak || 0;
  
  // Don't render anything if there's no active streak
  if (streakCount <= 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="text-xl">🔥</div>
      <div>
        <div className="font-bold text-md">
          {streakCount} Day{streakCount !== 1 ? 's' : ''} Streak
        </div>
      </div>
    </div>
  );
}

// 'use client';
// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';

// export function StreakDisplay() {
//   const { data } = useQuery({
//     queryKey: ['streak'],
//     queryFn: async () => {
//       const res = await axios.get(`/api/login-streak/userStreak`);
//       console.log("streak:" , res.data);
//       return res.data;
//     }
//   });

//   const streakCount = data?.streak?.currentStreak || 0;

//   return (
//     <div>
//       <div className="flex items-center gap-2">
//         <div className="text-xl">🔥</div>
//         <div>
//           <div className="font-bold text-md">
//             {streakCount} Day{streakCount !== 1 ? 's' : ''} streak
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }