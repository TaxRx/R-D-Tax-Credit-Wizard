import React, { useState, useEffect } from 'react';
import { SelectedSubcomponent, ResearchSubcomponent } from "../../../../../types/researchDesign";

interface SubcomponentCardProps {
  stepId: string;
  researchActivityId: string;
  businessYearId: string;
  businessId: string;
  year: number;
  selectedRoles: string[];
  onUpdate: (subcomponentId: string, updates: Partial<SelectedSubcomponent>) => void;
  selectedSubcomponents: SelectedSubcomponent[];
  masterSubcomponents: ResearchSubcomponent[];
}

const EDITABLE_FIELDS = [
  { key: 'general_description', label: 'General Description' },
  { key: 'goal', label: 'Goal' },
  { key: 'hypothesis', label: 'Hypothesis' },
  { key: 'alternatives', label: 'Alternative Approaches' },
  { key: 'uncertainties', label: 'Uncertainties' },
  { key: 'developmental_process', label: 'Development Process' },
  { key: 'primary_goal', label: 'Primary Goal' },
  { key: 'expected_outcome_type', label: 'Expected Outcome Type' },
  { key: 'cpt_codes', label: 'CPT Codes' },
  { key: 'cdt_codes', label: 'CDT Codes' },
  { key: 'alternative_paths', label: 'Alternative Paths' }
];

const SubcomponentCard: React.FC<SubcomponentCardProps> = ({
  stepId,
  researchActivityId,
  businessYearId,
  businessId,
  year,
  selectedRoles,
  onUpdate,
  selectedSubcomponents,
  masterSubcomponents
}) => {
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const [fieldValues, setFieldValues] = useState<{ [subId: string]: { [field: string]: string } }>({});

  useEffect(() => {
    // Prefill field values from override if present, else master
    const values: { [subId: string]: { [field: string]: string } } = {};
    masterSubcomponents.forEach(master => {
      const override = selectedSubcomponents.find(
        s => s.subcomponent_id === master.id && s.business_year_id === businessYearId && s.step_id === stepId
      );
      values[master.id] = {};
      EDITABLE_FIELDS.forEach(({ key }) => {
        values[master.id][key] = (override && (override as any)[key]) || (master as any)[key] || '';
      });
    });
    setFieldValues(values);
  }, [masterSubcomponents, selectedSubcomponents, businessYearId, stepId]);

  const handleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFieldChange = (subId: string, field: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: value
      }
    }));
    // Upsert to override table
    onUpdate(subId, { [field]: value });
  };

  if (!masterSubcomponents.length) {
    return <div className="text-center py-4 text-gray-500">No subcomponents found for this step.</div>;
  }

  return (
    <div className="space-y-4">
      {masterSubcomponents.map(master => {
        const override = selectedSubcomponents.find(
          s => s.subcomponent_id === master.id && s.business_year_id === businessYearId && s.step_id === stepId
        );
        // Use override for hint if present, else master
        const hint = (override && (override as any).hint) || (master as any).hint || master.description || '';
        const isExpanded = expanded[master.id];
        
        return (
          <div key={master.id} className="group">
            {/* Collapsed view: modern card design */}
            <div 
              className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group-hover:border-blue-300"
              onClick={() => handleExpand(master.id)}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {master.name}
                    </h5>
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      {hint || "No description available"}
                    </p>
                    
                    {/* Status indicator */}
                    {override && (
                      <div className="mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Customized
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expand/Collapse button */}
                <div className="flex items-center space-x-3">
                  <button 
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isExpanded 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                    }`}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Expanded view: modern form design */}
            {isExpanded && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg mt-2">
                <div className="mb-6">
                  <h6 className="text-lg font-semibold text-blue-900 mb-2">Customize Subcomponent Details</h6>
                  <p className="text-blue-700 text-sm">Edit the descriptive fields to match your specific research implementation</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {EDITABLE_FIELDS.map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium text-blue-900">
                        {label}
                      </label>
                      <textarea
                        value={fieldValues[master.id]?.[key] || ''}
                        onChange={e => handleFieldChange(master.id, key, e.target.value)}
                        className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white shadow-sm transition-all duration-200"
                        rows={3}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Save indicator */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Changes save automatically</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SubcomponentCard; 