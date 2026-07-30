import React from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer, YAxis, XAxis } from 'recharts';
export const RechartLinearChart = ({ data }) => {
    const [showHelp, setShowHelp] = React.useState(false);

    const tideWaterToChartData = (tideWater) => {
        // Sort tidewater by timestamp
        tideWater.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        // If timestamp is older than 6 hours discard the item
        const twelveHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        tideWater = tideWater.filter(item => new Date(item.timestamp) >= twelveHoursAgo);
        // Or older than 12 hours
        const twelveHoursFromNow = new Date(Date.now() + 12 * 60 * 60 * 1000);
        tideWater = tideWater.filter(item => new Date(item.timestamp) <= twelveHoursFromNow);
        // Map to chart data
        const timeStampToPrettyTime = (timestamp) => {
            const date = new Date(timestamp);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        return tideWater.map((item) => ({
            time: timeStampToPrettyTime(item.timestamp),
            timestamp: item.timestamp,
            height: Number(item.tideHeight.toFixed(0)),
        }));
    }

    const chartData = tideWaterToChartData(data || []);

    const nowMarkerIndex = chartData.length > 0
        ? chartData.reduce((closestIndex, point, index) => {
            const currentDistance = Math.abs(new Date(point.timestamp) - Date.now());
            const closestDistance = Math.abs(new Date(chartData[closestIndex].timestamp) - Date.now());
            return currentDistance < closestDistance ? index : closestIndex;
        }, 0)
        : -1;

    if (!data || data.length === 0) {
        return <p className="is-size-7 has-text-grey-light mb-1">Ingen observationer tilgængelige</p>;
    }
    return (
        <div className="box glass mb-2" >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <p className='title is-size-6 mb-0'>Tidevand</p>
                <span
                    role="button"
                    tabIndex={0}
                    aria-label="Forklaring til tidevandsgrafen"
                    onMouseEnter={() => setShowHelp(true)}
                    onMouseLeave={() => setShowHelp(false)}
                    onFocus={() => setShowHelp(true)}
                    onBlur={() => setShowHelp(false)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#ff8c00',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'help',
                        userSelect: 'none',
                        position: 'relative'
                    }}
                >
                    ?
                    {showHelp && (
                        <span
                            style={{
                                position: 'absolute',
                                left: 'calc(100% + 8px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '220px',
                                background: 'rgba(17, 24, 39, 0.95)',
                                color: '#fff',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                lineHeight: 1.4,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                zIndex: 10,
                                pointerEvents: 'none'
                            }}
                        >
                            <p>Den orange prik er lige nu.</p>
                            <br />
                            <p>Hvornår er det bedst at finde rav?</p>
                            <br />
                            <p>Søg fra højvandet topper og hele vejen ned mod lavvande. Det faldende vand efterlader ravet øverst i strandens mørke opskyl. Ravsøgningen er bedst lige efter storm eller blæst, når pålandsvinden skubber materialet ind.</p>
                        </span>
                    )}
                </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart width={"100%"} height={200} data={chartData}>
                    <XAxis dataKey="time" />
                    <YAxis dataKey="height" unit="cm" />
                    <Tooltip />
                    {/* <CartesianGrid /> */}
                    <Line
                        type="monotone"
                        dataKey="height"
                        dot={(props) => {
                            const { cx, cy, index } = props;
                            if (index !== nowMarkerIndex) {
                                return null;
                            }

                            return <circle cx={cx} cy={cy} r={4} fill="#ff8c00" stroke="#fff" strokeWidth={2} />;
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <p className='subtitle is-size-7'>Seneste observation {chartData[nowMarkerIndex]?.height}cm</p>
        </div>
    );
};

// stroke="#f5f5f5"
// stroke="#ff7300"