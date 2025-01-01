import React, { useEffect, useState } from 'react';

const DetectionLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetch('/logs/detection_log.csv')
            .then((response) => response.text())
            .then((text) => {
                const rows = text.split('\n').slice(1); // Skip header
                const parsedLogs = rows.map((row) => {
                    const [timestamp, object, confidence] = row.split(',');
                    return { timestamp, object, confidence };
                });
                setLogs(parsedLogs);
            });
    }, []);

    return (
        <div>
            <h2>Detection Logs</h2>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Object</th>
                        <th>Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.timestamp}</td>
                            <td>{log.object}</td>
                            <td>{log.confidence}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DetectionLogs;
