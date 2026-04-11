import { useEffect } from "react";
import { useToast } from "react-native-toast-notifications";
import { setToast } from "../utils/toast";

const ToastInitializer = () => {

  const toast = useToast();

  useEffect(() => {
    setToast(toast);
  }, [toast]);

  return null;
};

export default ToastInitializer;
