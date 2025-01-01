import React from 'react';
import TrafficChart from './components/TrafficChart';
import DetectionLogs from './components/DetectionLogs';
import Header from './components/Header';

const App = () => {
    const dummyData = [
        { timestamp: '2024-12-24 12:00:00', count: 5 },
        { timestamp: '2024-12-24 12:05:00', count: 7 },
        { timestamp: '2024-12-24 12:10:00', count: 4 },
    ];

    return (
        <div>
            <Header />
            <main>
                <TrafficChart data={dummyData} />
                <DetectionLogs />
            </main>
        </div>
    );
};

export default App;
