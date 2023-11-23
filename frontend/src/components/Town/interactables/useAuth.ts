import { useState, useEffect } from 'react'
import axios from 'axios';

// export default function useAuth(code: string) {

//     const [accessToken, setAccessToken] = useState();
//     const [refreshToken, setRefreshToken] = useState();

//     useEffect(() => {
//         axios.post('http://localhost:3000/login', {
//             code,

//     }).then(res => {
//         setAccessToken(res.data.accessToken);
//         setRefreshToken(res.data.refreshToken);
//         window.history.pushState({}, '', '/');
//     }).catch(() => {
//         window.location.href = '/' 
//     });
//     },
//     [code]);
//     return accessToken;
// }
