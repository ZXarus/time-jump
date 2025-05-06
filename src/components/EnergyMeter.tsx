import React from 'react';

interface EnergyMeterProps {
  energy: number;
  maxEnergy: number;
}

const EnergyMeter: React.FC<EnergyMeterProps> = ({ energy, maxEnergy }) => {
  const percentage = (energy / maxEnergy) * 100;
  
  // Determine color based on energy level
  const getEnergyColor = () => {
    if (percentage >= 80) return 'bg-cyan-500';
    if (percentage >= 40) return 'bg-cyan-400';
    if (percentage >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${getEnergyColor()} transition-all duration-300 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default EnergyMeter;