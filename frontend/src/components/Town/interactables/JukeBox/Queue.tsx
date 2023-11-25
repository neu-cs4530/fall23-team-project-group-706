import React from 'react';
import { Song } from '../../../../../../shared/types/CoveyTownSocket';


interface QueueProps {
    queue: Song[];
}

const Queue: React.FC<QueueProps> = ({ queue }) => {
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
