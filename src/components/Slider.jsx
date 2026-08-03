import * as m from '../paraglide/messages.js';
const values = ['Nu', 'Om 12 timer', 'I morgen', 'Om 36 timer', 'Om 48 timer'];
export default function Slider({ min, max, value, onChange }) {
    const handleChange = (event) => {
        const newValue = parseFloat(event.target.value);
        onChange(newValue);
    };
    return (
        <div className="columns is-mobile" style={{ position: 'fixed', zIndex: 401, bottom: 0 }}>
            <div className="column is-full-mobile" >
                <div className="box m-5 p-4 glass" >
                    <p className="mb-2 subtitle is-size-7">{m.choose_forecast_window()}</p>
                    <p>
                        <strong className="subtitle is-size-7">{values[value]}</strong>
                    </p>
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