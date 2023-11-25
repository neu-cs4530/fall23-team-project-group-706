import React, { useEffect, useState } from 'react';
import { Song } from '../../../../../../shared/types/CoveyTownSocket';
import { getQueue } from './spotifyServices';


const Queue: React.FC = () => {

    const [queue, setQueue] = useState<Song[]>([]);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const queueData = await getQueue();
                setQueue(queueData);
            } catch (error) {
                console.error('Error fetching queue:', error);
            }
        };

        fetchQueue();
    }, []);

    return (
        <div>
            <h2>Queue</h2>
            <ul>
                {queue.map((song, index) => (
                    <li key={index}>
                        {song.name} by {song.artists.map((artist) => artist.name).join(', ')}
                    </li>
                ))}
            </ul>
        </div>
    );  
};

export default Queue;
