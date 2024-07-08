// // src/components/TeamMembers.js
// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import ErrorCard from '../components/ErrorCard';
// import { userAsyncActions } from '../redux/slices/userSlice';
// import "../styles/TeamMembers.scss";

// const TeamMembers = () => {
//   const dispatch = useDispatch();
//   const { Team, loading, error } = useSelector(state => state.user);

//   useEffect(() => {
//     dispatch(userAsyncActions.getTeam({Data:""}) );
//   }, [dispatch]);

//   return (
//     <div className="team-members">
//       <h1>Team Members</h1>
//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
// <ErrorCard message={error}/>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Picture</th>
//               <th>Email</th>
//               <th>Role</th>
//               <th>Phone</th>
//               <th>Zipcode</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Team?.map(member => (
//               <tr key={member._id}>
//                 <td>
//                   <img src={member.avatar?.url || 'default-avatar.png'} alt="avatar" className="avatar" />
//                 </td>
//                 <td>{member.email}</td>
//                 <td>{member.role}</td>
//                 <td>{member.phone}</td>
//                 <td>{member.zipcode}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default TeamMembers;
