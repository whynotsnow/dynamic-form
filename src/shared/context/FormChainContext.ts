import { createContext, useContext } from 'react';
import { FormChainContextType } from '../types';

export const FormChainContext = createContext<FormChainContextType | null>(null);

export const useFormChainContext = () => {
  const context = useContext(FormChainContext);
  if (!context)
    throw new Error(
      'useContext FormChainContext context初始化失败,请检查DynamicForm是否包裹了FormChainEffectEngineWrapper'
    );
  return context;
};
