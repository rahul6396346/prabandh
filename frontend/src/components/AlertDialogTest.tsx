import React, { useState } from 'react';
import { AlertDialogCustom } from './ui/alert-dialog-custom';
import { Button } from './ui/button';

export const AlertDialogTest: React.FC = () => {
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <div className="p-8">
      <Button 
        onClick={() => setAlertOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Test Alert Dialog
      </Button>

      <AlertDialogCustom
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title="Test Alert"
        description="This is a test alert dialog to verify it's working properly."
        type="warning"
        confirmText="Got it!"
        onConfirm={() => {
          console.log('Alert confirmed!');
          setAlertOpen(false);
        }}
      />
    </div>
  );
};
