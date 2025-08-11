import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import BusinessSetupStep from './steps/BusinessSetupStep';
import ResearchExplorerStep from './steps/ResearchExplorerStep';
import ResearchDesignStep from './steps/ResearchDesignStep';
import EmployeeSetupStep from './steps/EmployeeSetupStep';
import ExpenseEntryStep from './steps/ExpenseEntryStep';
import CalculationStep from './steps/CalculationStep';
import ReportStep from './steps/ReportStep';

interface RDTaxWizardProps {
  onClose: () => void;
  businessId?: string;
  startStep?: number;
}

interface WizardState {
  currentStep: number;
  business: any;
  selectedYear: any;
  selectedActivities: any[];
  employees: any[];
  supplies: any[];
  contractors: any[];
  calculations: any;
  isComplete: boolean;
}

const RDTaxWizard: React.FC<RDTaxWizardProps> = ({ onClose, businessId, startStep = 0 }) => {
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: startStep,
    business: null,
    selectedYear: null,
    selectedActivities: [],
    employees: [],
    supplies: [],
    contractors: [],
    calculations: null,
    isComplete: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Load existing business data if businessId is provided
  useEffect(() => {
    const loadBusinessData = async () => {
      if (!businessId) return;

      setLoading(true);
      try {
        const { data: business, error } = await supabase
          .from('rd_businesses')
          .select(`
            *,
            rd_business_years (*)
          `)
          .eq('id', businessId)
          .single();

        if (error) throw error;

        if (business) {
          setWizardState(prev => ({
            ...prev,
            business: business,
            selectedYear: business.rd_business_years?.[0] || null
          }));
        }
      } catch (error) {
        console.error('Error loading business data:', error);
        setError('Failed to load business data');
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, [businessId]);

  const steps = [
    { title: 'Business Setup', description: 'Enter business information and tax year' },
    { title: 'Research Explorer', description: 'Explore and select research activities' },
    { title: 'Research Design', description: 'Configure detailed research activity breakdown' },
    { title: 'Employee Setup', description: 'Add employees and their roles' },
    { title: 'Expense Entry', description: 'Enter supplies and contractor costs' },
    { title: 'Calculation', description: 'Review QRE calculations and credits' },
    { title: 'Report', description: 'Generate and download your report' }
  ];

  const handleNext = () => {
    if (wizardState.currentStep < steps.length - 1) {
      setWizardState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    }
  };

  const handlePrevious = () => {
    if (wizardState.currentStep > 0) {
      setWizardState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const updateWizardState = (updates: Partial<WizardState>) => {
    console.log('RDTaxWizard: Updating wizard state with:', updates);
    setWizardState(prev => {
      const newState = { ...prev, ...updates };
      console.log('RDTaxWizard: New wizard state:', newState);
      return newState;
    });
  };

  const renderCurrentStep = () => {
    switch (wizardState.currentStep) {
      case 0:
        return (
          <BusinessSetupStep
            business={wizardState.business}
            selectedYear={wizardState.selectedYear}
            onUpdate={(updates) => updateWizardState(updates)}
            onNext={handleNext}
            userId={userId || undefined}
          />
        );
      case 1:
        return (
          <ResearchExplorerStep
            selectedActivities={wizardState.selectedActivities}
            onUpdate={(updates) => updateWizardState(updates)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            parentSelectedYear={wizardState.selectedYear?.year}
          />
        );
      case 2:
        console.log('RDTaxWizard: Rendering Research Design step with selectedActivities:', wizardState.selectedActivities);
        console.log('RDTaxWizard: businessYearId:', wizardState.selectedYear?.id);
        return (
          <ResearchDesignStep
            selectedActivities={wizardState.selectedActivities}
            businessYearId={wizardState.selectedYear?.id || ''}
            businessId={wizardState.business?.id}
            year={wizardState.selectedYear?.year}
            onUpdate={(updates) => updateWizardState(updates)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <EmployeeSetupStep
            employees={wizardState.employees}
            onUpdate={(updates) => updateWizardState(updates)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ExpenseEntryStep
            supplies={wizardState.supplies}
            contractors={wizardState.contractors}
            onUpdate={(updates) => updateWizardState(updates)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            businessId={wizardState.business?.id}
            businessYearId={wizardState.selectedYear?.id}
          />
        );
      case 5:
        return (
          <CalculationStep
            wizardState={wizardState}
            onUpdate={(updates) => updateWizardState(updates)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <ReportStep
            wizardState={wizardState}
            onComplete={onClose}
            onPrevious={handlePrevious}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header - Updated to match Dark Blue Gradient */}
        <div className="bg-gradient-to-r from-[#1a1a3f] to-[#2d2d67] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">R&D Tax Credit Wizard</h2>
              <p className="text-blue-100">
                Step {wizardState.currentStep + 1} of {steps.length}: {steps[wizardState.currentStep].title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Clickable Progress Steps */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-100 mb-2">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setWizardState(prev => ({
                      ...prev,
                      currentStep: index
                    }));
                  }}
                  className={`hover:text-white transition-colors cursor-pointer text-left ${
                    index <= wizardState.currentStep ? 'text-white' : 'text-blue-200'
                  } ${index === wizardState.currentStep ? 'font-semibold' : ''}`}
                  title={`Go to ${step.title}`}
                >
                  {step.title}
                </button>
              ))}
            </div>
            <div className="w-full bg-blue-200/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((wizardState.currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading business data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            renderCurrentStep()
          )}
        </div>

        {/* Footer Navigation - Updated to match Tax Calculator Dark Bar */}
        <div className="bg-gradient-to-r from-[#1a1a3f] to-[#2d2d67] px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            {/* Left side - Practice Name, State, and Report Buttons */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">
                  {wizardState.business?.name || 'Business Setup'}
                </span>
                {wizardState.business?.contact_info?.state && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-300">
                      {wizardState.business.contact_info.state}
                    </span>
                  </>
                )}
              </div>
              
              {/* Subtle Report Buttons */}
              <div className="flex items-center space-x-2">
                {/* Research Report Button (Step 2 - Research Explorer) */}
                {wizardState.currentStep === 1 && (
                  <button
                    onClick={() => console.log('Research Report functionality - not implemented in this version')}
                    className="px-3 py-1.5 text-xs bg-white/10 text-blue-200 rounded-md hover:bg-white/20 hover:text-white transition-colors border border-white/20"
                    title="Generate Research Report"
                  >
                    Research Report
                  </button>
                )}
                
                {/* Allocation Report Button (Steps 3-4 - Research Design & Employees) */}
                {(wizardState.currentStep === 2 || wizardState.currentStep === 3) && (
                  <button
                    onClick={() => console.log('Allocation Report functionality - not implemented in this version')}
                    className="px-3 py-1.5 text-xs bg-white/10 text-blue-200 rounded-md hover:bg-white/20 hover:text-white transition-colors border border-white/20"
                    title="Generate Allocation Report"
                  >
                    Allocation Report
                  </button>
                )}
                
                {/* Filing Guide Button (Step 5 - Reports) */}
                {wizardState.currentStep === 6 && wizardState.calculations && (
                  <button
                    onClick={() => console.log('Filing Guide functionality - not implemented in this version')}
                    className="px-3 py-1.5 text-xs bg-white/10 text-blue-200 rounded-md hover:bg-white/20 hover:text-white transition-colors border border-white/20"
                    title="Generate Filing Guide"
                  >
                    Filing Guide
                  </button>
                )}
              </div>
            </div>

            {/* Center - Total Credits Display (when applicable) */}
            <div className="flex items-center">
              {(wizardState.currentStep === 5 || wizardState.currentStep === 6) && wizardState.calculations && (
                <div className="flex items-center space-x-2 bg-white/10 rounded-md px-3 py-2">
                  <span className="text-sm font-medium">Total Credits:</span>
                  <span className="text-lg font-bold text-green-300">
                    ${wizardState.calculations.totalCredits?.toLocaleString() || '0'}
                  </span>
                </div>
              )}
            </div>

            {/* Right side - Year Dropdown and Navigation buttons */}
            <div className="flex items-center space-x-3">
              {/* Year Dropdown (when applicable) */}
              {(wizardState.currentStep === 1 || wizardState.currentStep === 2 || wizardState.currentStep === 3) && wizardState.selectedYear && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-blue-100">Year:</label>
                  <select
                    value={wizardState.selectedYear.year || new Date().getFullYear()}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      // Update wizard state with new year
                      setWizardState(prev => ({
                        ...prev,
                        selectedYear: { ...prev.selectedYear, year }
                      }));
                    }}
                    className="rounded-md border-none bg-white/10 text-white shadow-sm focus:ring-2 focus:ring-blue-400 px-3 py-1 text-sm"
                  >
                    {/* Generate year options from 2020 to current + 2 */}
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const years = [];
                      for (let year = 2020; year <= currentYear + 2; year++) {
                        years.push(year);
                      }
                      return years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ));
                    })()}
                  </select>
                </div>
              )}
              
              {/* Navigation buttons */}
              {wizardState.currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                >
                  Previous
                </button>
              )}
              {wizardState.currentStep < steps.length - 1 && (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-md"
                >
                  Next
                </button>
              )}
              {wizardState.currentStep === steps.length - 1 && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-md"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RDTaxWizard; 