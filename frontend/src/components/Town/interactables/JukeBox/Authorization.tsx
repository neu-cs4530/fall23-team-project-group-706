import React, { useEffect } from 'react';
import { authorizeUser } from './spotifyServices';


interface AuthorizationProps {
    onAuthorized: () => void;
}

const Authorization: React.FC<AuthorizationProps> = ({ onAuthorized }) => {
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            authorizeUser(code)
                .then(() => {
                    onAuthorized();
                })
                .catch((error) => {
                    console.error('Authorization error:', error);
                    // Handle the authorization error
                });
        }
    }, [onAuthorized]);

    return <div>Authorizing...</div>;
};

export default Authorization;
