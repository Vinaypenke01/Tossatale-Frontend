import { UnsavedChangesModal } from "./UnsavedChangesModal";

interface UnsavedHomepageChangesModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  onPublishAndLeave: () => void;
  onStay: () => void;
  onDiscardAndLeave: () => void;
}

export function UnsavedHomepageChangesModal({
  isOpen,
  isSaving = false,
  onPublishAndLeave,
  onStay,
  onDiscardAndLeave,
}: UnsavedHomepageChangesModalProps) {
  return (
    <UnsavedChangesModal
      isOpen={isOpen}
      isSaving={isSaving}
      title="Unpublished Changes Detected!"
      badgeText="Changes Were Not Applied"
      description="You made adjustments to the Homepage & Site Builder layout, but you haven't clicked 'Publish changes' yet."
      tipText="Click 'Publish & Continue' below to publish all your adjustments live to readers immediately!"
      saveButtonText="Publish & Continue"
      onSaveAndLeave={onPublishAndLeave}
      onStay={onStay}
      onDiscardAndLeave={onDiscardAndLeave}
    />
  );
}
