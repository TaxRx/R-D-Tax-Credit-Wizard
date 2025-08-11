import React from 'react';
import RDTaxWizard from '../modules/tax-calculator/components/RDTaxWizard/RDTaxWizard';

interface RDTCreditWizardProps {
  onClose: () => void;
}

const RDTCreditWizard: React.FC<RDTCreditWizardProps> = ({ onClose }) => {
  return <RDTaxWizard onClose={onClose} />;
};

export default RDTCreditWizard; 