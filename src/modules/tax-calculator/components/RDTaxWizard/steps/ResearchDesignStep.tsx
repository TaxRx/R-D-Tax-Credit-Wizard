import React, { useState, useEffect } from 'react';
import { ResearchDesignService } from "../../../../../services/researchDesignService";
import {
  ResearchActivityWithSteps,
  SelectedStep,
  SelectedSubcomponent,
  STEP_COLORS,
  SUBCOMPONENT_COLORS
} from "../../../../../types/researchDesign";
import SubcomponentCard from './SubcomponentCard';

interface ResearchDesignStepProps {
  selectedActivities: Array<{ 
    id: string; 
    activity_id: string;
    activity_name?: string;
    name?: string; // For backward compatibility
    practice_percent?: number;
    percentage?: number; // For backward compatibility
    selected_roles?: string[];
  }>;
  businessYearId: string;
  businessId?: string;
  year?: number;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface ResearchStep {
  id: string;
  name: string;
  percentage: number;
  isLocked: boolean;
  isEnabled: boolean;
  order: number;
  subcomponents: any[];
}

// Custom slider styles
const sliderStyles = `
  .slider-blue::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider-purple::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider-blue::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider-purple::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const ResearchDesignStep: React.FC<ResearchDesignStepProps> = ({
  selectedActivities: selectedActivitiesProp,
  businessYearId,
  businessId,
  year,
  onUpdate,
  onNext,
  onPrevious
}) => {
  console.log('ResearchDesignStep: Component mounted with props:', {
    selectedActivitiesProp,
    businessYearId,
    businessId,
    year,
    onUpdate: typeof onUpdate,
    onNext: typeof onNext,
    onPrevious: typeof onPrevious
  });

  const [selectedActivities, setSelectedActivities] = useState<Array<{ 
    id: string; 
    activity_id: string;
    activity_name?: string;
    name?: string;
    practice_percent?: number;
    percentage?: number;
    selected_roles?: string[];
  }>>([]);
  const [activitiesWithSteps, setActivitiesWithSteps] = useState<ResearchActivityWithSteps[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<SelectedStep[]>([]);
  const [selectedSubcomponents, setSelectedSubcomponents] = useState<SelectedSubcomponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [nonRdPercentage, setNonRdPercentage] = useState(0);

  // New state for step allocation
  const [researchSteps, setResearchSteps] = useState<ResearchStep[]>([]);
  const [showStepAllocation, setShowStepAllocation] = useState(false);

  // Extract businessId and year if not provided
  const effectiveBusinessId = businessId || businessYearId.split('_')[0]; // Assuming format: businessId_year
  const effectiveYear = year || new Date().getFullYear();

  // Helper functions to handle both old and new data structures
  const getActivityName = (activity: any) => {
    return activity.activity_name || activity.activityName || activity.name || 'Unknown Activity';
  };

  const getActivityPercentage = (activity: any) => {
    return activity.practice_percent || activity.percentage || 0;
  };

  const getActivityId = (activity: any) => {
    return activity.activity_id || activity.activityId || activity.id;
  };

  // Load selected activities from database
  const loadSelectedActivities = async () => {
    console.log('ResearchDesignStep: loadSelectedActivities called with businessYearId:', businessYearId);
    
    if (!businessYearId) {
      console.log('ResearchDesignStep: No businessYearId provided, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      console.log('ResearchDesignStep: Calling ResearchDesignService.getSelectedActivities...');
      const activities = await ResearchDesignService.getSelectedActivities(businessYearId);
      console.log('ResearchDesignStep: Received activities from service:', activities);
      
      setSelectedActivities(activities);
      
      // Update parent component
      onUpdate({ selectedActivities: activities });
    } catch (error) {
      console.error('ResearchDesignStep: Error loading selected activities:', error);
    }
  };

  useEffect(() => {
    // If we have activities from the parent component, use those
    if (selectedActivitiesProp && selectedActivitiesProp.length > 0) {
      console.log('ResearchDesignStep: Using activities from parent component:', selectedActivitiesProp);
      setSelectedActivities(selectedActivitiesProp);
    } else {
      // Only load from database if no activities are provided
      console.log('ResearchDesignStep: No activities from parent, loading from database');
      loadSelectedActivities();
    }
  }, [selectedActivitiesProp, businessYearId]);

  // Reset activeStepIndex when switching activities
  useEffect(() => {
    setActiveStepIndex(0);
  }, [activeActivityIndex]);

  useEffect(() => {
    loadResearchDesignData();
  }, [selectedActivities, businessYearId]);

  const loadResearchDesignData = async () => {
    if (!selectedActivities.length || !businessYearId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First, check if there are any steps in the database at all
      const allSteps = await ResearchDesignService.getAllSteps();
      console.log('ResearchDesignStep: All steps in database:', allSteps);
      
      const activityIds = selectedActivities.map(activity => getActivityId(activity));
      console.log('ResearchDesignStep: Activity IDs to load:', activityIds);
      
      // Load activities with steps and subcomponents
      const activitiesData = await ResearchDesignService.getActivitiesWithSteps(activityIds);
      console.log('ResearchDesignStep: Activities with steps data:', activitiesData);
      setActivitiesWithSteps(activitiesData);

      // Load existing selections
      const [stepsData, subcomponentsData] = await Promise.all([
        ResearchDesignService.getSelectedSteps(businessYearId),
        ResearchDesignService.getSelectedSubcomponents(businessYearId)
      ]);

      setSelectedSteps(stepsData);
      setSelectedSubcomponents(subcomponentsData);
    } catch (error) {
      console.error('Error loading research design data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStepTimePercentage = async (stepId: string, timePercentage: number) => {
    const currentActivity = activitiesWithSteps[activeActivityIndex];
    if (!currentActivity) return;

    const step = currentActivity.steps.find(s => s.id === stepId);
    if (!step) return;

    const existingStep = selectedSteps.find(s => s.step_id === stepId);
    const appliedPercentage = (getActivityPercentage(selectedActivities[activeActivityIndex]) || 0) * timePercentage / 100;

    const stepData: Omit<SelectedStep, 'id' | 'created_at' | 'updated_at'> = {
      business_year_id: businessYearId,
      research_activity_id: currentActivity.activityId,
      step_id: stepId,
      time_percentage: timePercentage,
      applied_percentage: appliedPercentage
    };

    const savedStep = await ResearchDesignService.saveSelectedStep(stepData);
    if (savedStep) {
      setSelectedSteps(prev => {
        const filtered = prev.filter(s => s.step_id !== stepId);
        return [...filtered, savedStep];
      });
    }
  };

  const updateSubcomponent = async (subcomponentId: string, updates: Partial<SelectedSubcomponent>) => {
    const currentActivity = activitiesWithSteps[activeActivityIndex];
    if (!currentActivity) return;

    const existing = selectedSubcomponents.find(s => s.subcomponent_id === subcomponentId);
    const currentYear = new Date().getFullYear();
    const currentStepId = currentActivity.steps[activeStepIndex]?.id;

    if (!currentStepId) {
      console.error('No current step ID found');
      return;
    }

    const subcomponentData: Omit<SelectedSubcomponent, 'id' | 'created_at' | 'updated_at'> = {
      business_year_id: businessYearId,
      research_activity_id: currentActivity.activityId,
      step_id: currentStepId,
      subcomponent_id: subcomponentId,
      frequency_percentage: existing?.frequency_percentage || 0,
      year_percentage: existing?.year_percentage || 100,
      start_month: existing?.start_month || 1,
      start_year: existing?.start_year || currentYear,
      selected_roles: existing?.selected_roles || [],
      non_rd_percentage: existing?.non_rd_percentage || 0,
      approval_data: existing?.approval_data || {},
      ...updates
    };

    const savedSubcomponent = await ResearchDesignService.saveSelectedSubcomponent(subcomponentData);
    if (savedSubcomponent) {
      setSelectedSubcomponents(prev => {
        const filtered = prev.filter(s => s.subcomponent_id !== subcomponentId);
        return [...filtered, savedSubcomponent];
      });
    }
  };

  const handleNonRdChange = (percentage: number) => {
    setNonRdPercentage(percentage);
    // Update all subcomponents to reflect the non-R&D percentage
    selectedSubcomponents.forEach(subcomponent => {
      updateSubcomponent(subcomponent.subcomponent_id, { non_rd_percentage: percentage });
    });
  };

  // Step allocation functions
  const initializeSteps = (activity: any) => {
    if (!activity.steps || activity.steps.length === 0) return;
    
    const stepCount = activity.steps.length;
    const equalPercentage = 100 / stepCount;
    
    const steps: ResearchStep[] = activity.steps.map((step: any, index: number) => ({
      id: step.id,
      name: step.name,
      percentage: equalPercentage,
      isLocked: false,
      isEnabled: true,
      order: index,
      subcomponents: step.subcomponents || []
    }));
    
    setResearchSteps(steps);
  };

  const adjustStepPercentage = (stepId: string, newPercentage: number) => {
    setResearchSteps(prevSteps => {
      const stepIndex = prevSteps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return prevSteps;
      
      const step = prevSteps[stepIndex];
      if (step.isLocked) return prevSteps;
      
      const unlockedSteps = prevSteps.filter(s => !s.isLocked && s.isEnabled);
      const lockedSteps = prevSteps.filter(s => s.isLocked && s.isEnabled);
      
      const lockedTotal = lockedSteps.reduce((sum, s) => sum + s.percentage, 0);
      const availablePercentage = 100 - lockedTotal - newPercentage;
      
      if (availablePercentage < 0) return prevSteps; // Invalid adjustment
      
      const remainingUnlockedSteps = unlockedSteps.filter(s => s.id !== stepId);
      const equalDistribution = remainingUnlockedSteps.length > 0 ? availablePercentage / remainingUnlockedSteps.length : 0;
      
      const newSteps = prevSteps.map(s => {
        if (s.id === stepId) {
          return { ...s, percentage: newPercentage };
        } else if (!s.isLocked && s.isEnabled && s.id !== stepId) {
          return { ...s, percentage: equalDistribution };
        }
        return s;
      });
      
      return newSteps;
    });
  };

  const toggleStepLock = (stepId: string) => {
    setResearchSteps(prevSteps => 
      prevSteps.map(s => 
        s.id === stepId ? { ...s, isLocked: !s.isLocked } : s
      )
    );
  };

  const toggleStepEnabled = (stepId: string) => {
    setResearchSteps(prevSteps => {
      const step = prevSteps.find(s => s.id === stepId);
      if (!step) return prevSteps;
      
      if (step.isEnabled) {
        // Disabling step - redistribute its percentage
        const remainingSteps = prevSteps.filter(s => s.id !== stepId && s.isEnabled);
        const equalDistribution = remainingSteps.length > 0 ? (100 - step.percentage) / remainingSteps.length : 0;
        
        return prevSteps.map(s => {
          if (s.id === stepId) {
            return { ...s, isEnabled: false, percentage: 0 };
          } else if (s.isEnabled) {
            return { ...s, percentage: equalDistribution };
          }
          return s;
        });
      } else {
        // Enabling step - give it equal share
        const enabledSteps = prevSteps.filter(s => s.isEnabled);
        const equalDistribution = 100 / (enabledSteps.length + 1);
        
        return prevSteps.map(s => {
          if (s.id === stepId) {
            return { ...s, isEnabled: true, percentage: equalDistribution };
          } else if (s.isEnabled) {
            return { ...s, percentage: equalDistribution };
          }
          return s;
        });
      }
    });
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    setResearchSteps(prevSteps => {
      const stepIndex = prevSteps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return prevSteps;
      
      const newSteps = [...prevSteps];
      const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
      
      if (targetIndex >= 0 && targetIndex < newSteps.length) {
        [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
        newSteps[stepIndex].order = stepIndex;
        newSteps[targetIndex].order = targetIndex;
      }
      
      return newSteps;
    });
  };

  const addNewStep = () => {
    setResearchSteps(prevSteps => {
      const enabledSteps = prevSteps.filter(s => s.isEnabled);
      const equalDistribution = 100 / (enabledSteps.length + 1);
      
      const newStep: ResearchStep = {
        id: `new-step-${Date.now()}`,
        name: `New Step ${prevSteps.length + 1}`,
        percentage: equalDistribution,
        isLocked: false,
        isEnabled: true,
        order: prevSteps.length,
        subcomponents: []
      };
      
      return prevSteps.map(s => 
        s.isEnabled ? { ...s, percentage: equalDistribution } : s
      ).concat(newStep);
    });
  };

  const resetToEqual = () => {
    setResearchSteps(prevSteps => {
      const enabledSteps = prevSteps.filter(s => s.isEnabled);
      const equalDistribution = enabledSteps.length > 0 ? 100 / enabledSteps.length : 0;
      
      return prevSteps.map(s => ({
        ...s,
        percentage: s.isEnabled ? equalDistribution : 0,
        isLocked: false
      }));
    });
  };

  // Initialize steps when activity changes
  useEffect(() => {
    if (activitiesWithSteps.length > 0 && activeActivityIndex >= 0) {
      const currentActivity = activitiesWithSteps[activeActivityIndex];
      if (currentActivity) {
        initializeSteps(currentActivity);
      }
    } else if (selectedActivities.length === 0) {
      // Mock data for testing when accessed directly
      const mockSteps: ResearchStep[] = [
        {
          id: 'mock-step-1',
          name: 'Research Planning',
          percentage: 25,
          isLocked: false,
          isEnabled: true,
          order: 0,
          subcomponents: []
        },
        {
          id: 'mock-step-2',
          name: 'Data Collection',
          percentage: 30,
          isLocked: false,
          isEnabled: true,
          order: 1,
          subcomponents: []
        },
        {
          id: 'mock-step-3',
          name: 'Analysis & Testing',
          percentage: 25,
          isLocked: false,
          isEnabled: true,
          order: 2,
          subcomponents: []
        },
        {
          id: 'mock-step-4',
          name: 'Documentation',
          percentage: 20,
          isLocked: false,
          isEnabled: true,
          order: 3,
          subcomponents: []
        }
      ];
      setResearchSteps(mockSteps);
    }
  }, [activitiesWithSteps, activeActivityIndex, selectedActivities.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedActivities.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No research activities selected. Please go back and select activities first.</p>
      </div>
    );
  }

  const currentActivity = activitiesWithSteps[activeActivityIndex];
  const currentActivityData = selectedActivities[activeActivityIndex];

  if (!currentActivity) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading activity data...</p>
      </div>
    );
  }

  const totalTimePercentage = currentActivity.steps.reduce((sum, step) => {
    const selectedStep = selectedSteps.find(s => s.step_id === step.id);
    return sum + (selectedStep?.time_percentage || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* TEMPORARY DEBUG BANNER - NEW UI IS LOADING */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg">🎨</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">NEW RESEARCH DESIGN UI LOADED!</h3>
            <p className="text-green-100">Modern gradient header, step allocation, and circular sliders are active</p>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      {/* Modern Gradient Header with Progress */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Research Design Studio</h2>
                <p className="text-blue-100 text-lg">
                  Configure time breakdown and subcomponent details for maximum R&D credit optimization
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-blue-100 text-sm font-medium">Live Configuration</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-blue-100 mb-2">
                <span>Configuration Progress</span>
                <span>{Math.round((selectedSubcomponents.length / (activitiesWithSteps.reduce((sum, activity) => sum + activity.steps.reduce((stepSum, step) => stepSum + step.subcomponents.length, 0), 0) || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-blue-500/30 rounded-full h-3">
                <div 
                  className="bg-green-400 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(selectedSubcomponents.length / (activitiesWithSteps.reduce((sum, activity) => sum + activity.steps.reduce((stepSum, step) => stepSum + step.subcomponents.length, 0), 0) || 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Navigation with Modern Cards */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Research Activities</h3>
          <p className="text-gray-600">Select an activity to configure its research design</p>
        </div>
        
        {/* Activity Cards Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedActivities.map((activity, index) => {
              const activityData = activitiesWithSteps.find(a => a.activityId === getActivityId(activity));
              const isActive = activeActivityIndex === index;
              const completionPercentage = activityData ? 
                (activityData.steps.reduce((sum, step) => 
                  sum + step.subcomponents.filter(sub => 
                    selectedSubcomponents.some(sel => sel.subcomponent_id === sub.id)
                  ).length, 0) / 
                  activityData.steps.reduce((sum, step) => sum + step.subcomponents.length, 0) * 100) : 0;
              
              return (
                <div
                  key={activity.id}
                  onClick={() => setActiveActivityIndex(index)}
                  className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                >
                  <div className={`bg-gradient-to-br rounded-xl p-6 shadow-lg border-2 transition-all duration-300 ${
                    isActive 
                      ? 'from-blue-500 to-blue-600 border-blue-400 text-white' 
                      : 'from-white to-gray-50 border-gray-200 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300'
                  }`}>
                    {/* Activity Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      isActive ? 'bg-white/20' : 'bg-blue-100'
                    }`}>
                      <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    
                    {/* Activity Info */}
                    <h4 className={`font-semibold text-lg mb-2 ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {getActivityName(activity)}
                    </h4>
                    <p className={`text-sm mb-3 ${isActive ? 'text-blue-100' : 'text-gray-600'}`}>
                      Practice: {getActivityPercentage(activity)}%
                    </p>
                    
                    {/* Completion Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={isActive ? 'text-blue-100' : 'text-gray-500'}>Progress</span>
                        <span className={isActive ? 'text-white' : 'text-gray-700'}>{Math.round(completionPercentage)}%</span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${isActive ? 'bg-white/30' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isActive ? 'bg-white' : 'bg-blue-500'
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      completionPercentage === 100 
                        ? 'bg-green-100 text-green-800' 
                        : completionPercentage > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {completionPercentage === 100 ? '✓ Complete' : completionPercentage > 0 ? '🔄 In Progress' : '⏳ Pending'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Activity Configuration */}
      {currentActivity && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-green-900 mb-1">
                  {getActivityName(currentActivityData)}
                </h3>
                <p className="text-green-700">Configure research steps and subcomponents</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-green-600">Practice Percentage</div>
                  <div className="text-2xl font-bold text-green-900">{getActivityPercentage(currentActivityData)}%</div>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Non-R&D Configuration */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-orange-900 mb-1">Non-R&D Time Allocation</h4>
                  <p className="text-orange-700 text-sm">Adjust the percentage of time not dedicated to R&D activities</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-900">{nonRdPercentage}%</div>
                  <div className="text-sm text-orange-600">Non-R&D</div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={nonRdPercentage}
                onChange={(e) => handleNonRdChange(Number(e.target.value))}
                className="w-full h-3 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${nonRdPercentage}%, #fed7aa ${nonRdPercentage}%, #fed7aa 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-orange-600 mt-2">
                <span>0% (All R&D)</span>
                <span>100% (No R&D)</span>
              </div>
            </div>

            {/* Time Breakdown Visualization */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-900 mb-4">Research Step Time Allocation</h4>
              <div className="space-y-4">
                {currentActivity.steps.map((step, index) => {
                  const selectedStep = selectedSteps.find(s => s.step_id === step.id);
                  const timePercentage = selectedStep?.time_percentage || 0;
                  const color = STEP_COLORS[index % STEP_COLORS.length];
                  
                  return (
                    <div key={step.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: color }}>
                            {index + 1}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{step.name}</h5>
                            <p className="text-sm text-gray-600">{step.subcomponents.length} subcomponents</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={timePercentage}
                            onChange={(e) => updateStepTimePercentage(step.id, Number(e.target.value))}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="text-gray-600 font-medium">%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${timePercentage}%`,
                            backgroundColor: color
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Total Summary */}
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Allocation</span>
                  <div className="flex items-center space-x-4">
                    <span className={`text-lg font-bold ${totalTimePercentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {totalTimePercentage}%
                    </span>
                    <span className="text-sm text-gray-500">
                      {totalTimePercentage > 100 ? 'Over-allocated' : totalTimePercentage < 100 ? 'Under-allocated' : 'Perfect'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Navigation and Subcomponents */}
            {currentActivity.steps.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-900 mb-4">Subcomponent Configuration</h4>
                
                {/* Step Navigation Tabs */}
                <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                  {currentActivity.steps.map((step, stepIndex) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStepIndex(stepIndex)}
                      className={`flex-shrink-0 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                        activeStepIndex === stepIndex
                          ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                          : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          activeStepIndex === stepIndex ? 'bg-white/20' : 'bg-purple-100'
                        }`}>
                          {stepIndex + 1}
                        </div>
                        <span>{step.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Current Step Content */}
                {currentActivity.steps[activeStepIndex] && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h5 className="text-xl font-semibold text-gray-900 mb-1">
                          {currentActivity.steps[activeStepIndex].name}
                        </h5>
                        <p className="text-gray-600">
                          Configure {currentActivity.steps[activeStepIndex].subcomponents.length} subcomponents
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>

                    {currentActivity.steps[activeStepIndex].subcomponents.length > 0 ? (
                      <div className="space-y-4">
                        {currentActivity.steps[activeStepIndex].subcomponents.map((subcomponent) => (
                          <SubcomponentCard
                            key={subcomponent.id}
                            stepId={currentActivity.steps[activeStepIndex].id}
                            researchActivityId={currentActivity.activityId}
                            businessYearId={businessYearId}
                            businessId={effectiveBusinessId}
                            year={effectiveYear}
                            selectedRoles={currentActivityData?.selected_roles || []}
                            onUpdate={updateSubcomponent}
                            selectedSubcomponents={selectedSubcomponents}
                            masterSubcomponents={currentActivity.steps[activeStepIndex].subcomponents}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500">No subcomponents found for this step.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Research Step Allocation Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Research Step Allocation</h3>
                <p className="text-emerald-100 text-sm">Distribute time across research steps</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetToEqual}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                Reset to Equal
              </button>
              <button
                onClick={() => setShowStepAllocation(!showStepAllocation)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                {showStepAllocation ? 'Hide' : 'Show'} Allocation
              </button>
            </div>
          </div>
        </div>

        {showStepAllocation && (
          <div className="p-6 space-y-6">
            {/* Total Percentage Display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Σ</span>
                  </div>
                  <span className="font-semibold text-gray-700">Total Allocation</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {researchSteps.reduce((sum, step) => sum + step.percentage, 0).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">Research Steps</h4>
              <button
                onClick={addNewStep}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Step</span>
              </button>
            </div>

            {/* Step Cards */}
            <div className="grid gap-4">
              {researchSteps
                .sort((a, b) => a.order - b.order)
                .map((step, index) => (
                  <div
                    key={step.id}
                    className={`relative bg-white rounded-xl border-2 transition-all duration-200 ${
                      step.isEnabled 
                        ? step.isLocked 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 hover:border-blue-300'
                        : 'border-red-200 bg-red-50 opacity-60'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            step.isEnabled 
                              ? step.isLocked 
                                ? 'bg-purple-500' 
                                : 'bg-blue-500'
                              : 'bg-red-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h5 className={`font-semibold ${
                              step.isEnabled ? 'text-gray-800' : 'text-gray-500'
                            }`}>
                              {step.name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              {step.subcomponents.length} subcomponents
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Move Up/Down */}
                          <button
                            onClick={() => moveStep(step.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveStep(step.id, 'down')}
                            disabled={index === researchSteps.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Lock/Unlock */}
                          <button
                            onClick={() => toggleStepLock(step.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              step.isLocked 
                                ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </button>
                          
                          {/* Enable/Disable */}
                          <button
                            onClick={() => toggleStepEnabled(step.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              step.isEnabled 
                                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.isEnabled ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"} />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Circular Knob Slider */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                            {/* Background circle */}
                            <circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="8"
                            />
                            {/* Progress circle */}
                            <circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke={step.isEnabled ? (step.isLocked ? "#8b5cf6" : "#3b82f6") : "#ef4444"}
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 54}`}
                              strokeDashoffset={`${2 * Math.PI * 54 * (1 - step.percentage / 100)}`}
                              strokeLinecap="round"
                              className="transition-all duration-300"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${
                                step.isEnabled ? (step.isLocked ? "text-purple-600" : "text-blue-600") : "text-red-600"
                              }`}>
                                {step.percentage.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">Time Allocation</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Linear Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>0%</span>
                          <span>100%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.1"
                          value={step.percentage}
                          onChange={(e) => adjustStepPercentage(step.id, parseFloat(e.target.value))}
                          disabled={step.isLocked || !step.isEnabled}
                          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                            step.isEnabled 
                              ? step.isLocked 
                                ? 'bg-purple-200 slider-purple' 
                                : 'bg-blue-200 slider-blue'
                              : 'bg-red-200'
                          }`}
                        />
                      </div>

                      {/* Status Indicators */}
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <div className="flex items-center space-x-4">
                          {step.isLocked && (
                            <span className="flex items-center space-x-1 text-purple-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>Locked</span>
                            </span>
                          )}
                          {!step.isEnabled && (
                            <span className="flex items-center space-x-1 text-red-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Disabled</span>
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500">
                          {step.subcomponents.length} subcomponents
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <span>Next</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ResearchDesignStep; 