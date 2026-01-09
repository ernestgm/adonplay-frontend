import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Colores para los gráficos
const COLORS = ['#0088FE', '#FFBB28'];

interface CircularProgressChartProps {
    data: {name:string, value: number}[];
}

const CircularChart: React.FC<CircularProgressChartProps> = ({ data }) => {

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
            {/* Gráfico de RAM */}
            <div style={{ textAlign: 'center' }}>
                <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={10}
                            outerRadius={40}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            <Cell key="used" fill={COLORS[0]} />
                            <Cell key="free" fill={COLORS[1]} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CircularChart;// Usado / Disponible