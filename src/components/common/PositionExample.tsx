
const getPositionStyle = (position: string): React.CSSProperties => {
    const base: React.CSSProperties = {
        position: 'absolute',
        background: '#4f46e5',
        width: '60px',
        height: '30px',
        borderRadius: '6px',
    };
    switch (position) {
        case 'tl': // top left
            return { ...base, top: 10, left: 10 };
        case 'tc': // top center
            return { ...base, top: 10, left: '50%', transform: 'translateX(-50%)' };
        case 'tr': // top right
            return { ...base, top: 10, right: 10 };
        case 'ml': // middle left
            return { ...base, top: '50%', left: 10, transform: 'translateY(-50%)' };
        case 'mc': // middle center
            return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        case 'mr': // middle right
            return { ...base, top: '50%', right: 10, transform: 'translateY(-50%)' };
        case 'bl': // bottom left
            return { ...base, bottom: 10, left: 10 };
        case 'bc': // bottom center
            return { ...base, bottom: 10, left: '50%', transform: 'translateX(-50%)' };
        case 'br': // bottom right
            return { ...base, bottom: 10, right: 10 };
        default:
            return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
};

const PositionExample = ({ position }: { position: string }) => {
    return (
        <div style={{ width: 180, height: 120, border: '2px solid #ccc', position: 'relative', background: '#f9f9f9' }}>
            <div style={getPositionStyle(position)}></div>
        </div>
    );
};

export default PositionExample;