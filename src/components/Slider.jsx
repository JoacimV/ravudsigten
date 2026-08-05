import * as m from '../paraglide/messages.js';
const values = [m.now(), m.in_x_hours({ x: '12' }), m.tomorrow(), m.in_x_hours({ x: '36' }), m.in_2_days()];
export default function Slider({ min, max, value, onChange }) {
    const handleChange = (event) => {
        const newValue = parseFloat(event.target.value);
        onChange(newValue);
    };
    return (
        <div className="columns is-mobile" style={{ position: 'fixed', zIndex: 401, bottom: 0 }}>
            <div className="column is-full-mobile" >
                <div className="box glass p-2 ml-5 m-2" >
                    {/* <p className="mb-2 subtitle is-size-7">{m.choose_forecast_window()}</p> */}
                    <p className="title is-size-7 m-0 p-1">                       {values[value]}                    </p>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        onChange={handleChange}
                    />
                </div >
            </div>
        </div >
    );
}