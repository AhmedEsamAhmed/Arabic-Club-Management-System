import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={clsx('flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none',
            activeTab === tab.value
              ? 'text-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {activeTab === tab.value && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 bg-white rounded-md shadow-sm"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
            {tab.count != null && (
              <span className={clsx(
                'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs',
                activeTab === tab.value ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
              )}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
