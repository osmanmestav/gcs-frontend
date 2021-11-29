import React from "react";
import { Button, Modal } from "react-bootstrap";

type MessageBoxProps =
{
    open: boolean,
    title: string | null,
    message: String,
    onConfirm: () => void,
    onDismiss: () => void
}


type MessageBoxConfig = {
    title: string | null,
    message: string,
    actionCallback: (arg: boolean) => {},
}

type MessageBoxOptions = {
  title: string | null,
  message: string,
}


const defaultMessageBoxConfig : MessageBoxConfig = {
    title: null,
    message: "",
    actionCallback: (val: boolean) => { return true; },
};


const MessageBox = ({ open, title, message, onConfirm, onDismiss }: MessageBoxProps) => {

    return(
      <Modal 
        show={open}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={ { whiteSpace: 'pre' }}>
          {message} 
        {/* // {message.replace("\n", "&nbsp;")} */}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onDismiss}>Cancel</Button>
          <Button color="primary" variant="contained" onClick={onConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

const MessageBoxContext = React.createContext({});

const MessageBoxProvider = ({ children }: any) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState<MessageBoxConfig>(defaultMessageBoxConfig);

  const openDialog = (dialogOptions: MessageBoxConfig) => {
    // console.log('openDialog -> setDialogOpen', setDialogOpen)
    // console.log('openDialog -> dialogOpen', dialogOpen)
    setDialogOpen(true);
    setDialogConfig(dialogOptions);
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setDialogConfig(defaultMessageBoxConfig);
  };

  const onConfirm = () => {
    resetDialog();
    dialogConfig.actionCallback(true);
  };

  const onDismiss = () => {
    resetDialog();
    dialogConfig.actionCallback(false);
  };

  return (
    <MessageBoxContext.Provider value={{ openDialog }}>
      <MessageBox
        open={dialogOpen}
        title={dialogConfig?.title}
        message={dialogConfig.message}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />
      {children}
    </MessageBoxContext.Provider>
  );
};
// MessageBoxProvider and applying in sanity check
const useMessageBox = () => {
    const { openDialog } : any = React.useContext(MessageBoxContext);
  
    const askConfirmation = (options: MessageBoxOptions) =>
      new Promise<boolean>((resolve) => {
        openDialog({ actionCallback: resolve, ...options });
      });
  
    return { askConfirmation };
  };

export {useMessageBox, MessageBoxProvider };