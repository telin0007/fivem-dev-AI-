
import { FiveMFile, Framework } from "../types";

export const detectFrameworkFromFiles = (files: FiveMFile[]): Framework | null => {
  // 1. Procurar por manifestos primeiro (fxmanifest.lua ou __resource.lua)
  const manifestFile = files.find(f => f.name.toLowerCase() === 'fxmanifest.lua' || f.name.toLowerCase() === '__resource.lua');
  const manifestContent = manifestFile?.content.toLowerCase() || "";

  // 2. Procurar por arquivos de core comuns
  const fileNames = files.map(f => f.name.toLowerCase());
  const allContent = files.map(f => f.content.toLowerCase()).join("\n");

  // --- DETECÇÃO QBCORE ---
  if (
    manifestContent.includes('qb-core') || 
    allContent.includes('qbcore:getobject') || 
    allContent.includes('qb-core:client:getobject') ||
    fileNames.some(name => name.startsWith('qb-'))
  ) {
    return Framework.QBCORE;
  }

  // --- DETECÇÃO ESX ---
  if (
    manifestContent.includes('es_extended') || 
    allContent.includes('esx:getsharedobject') || 
    allContent.includes('esx_core') ||
    fileNames.some(name => name.startsWith('esx_'))
  ) {
    return Framework.ESX;
  }

  // --- DETECÇÃO VRP / VRPEX ---
  if (
    allContent.includes('vrp.getuserid') || 
    allContent.includes('proxy.getinterface("vrp")') ||
    allContent.includes('tunnel.getinterface("vrp")') ||
    manifestContent.includes('vrp')
  ) {
    // Distinguir entre vRP e vRPex se possível (heurística simples)
    if (allContent.includes('vrpex') || allContent.includes('creative')) {
       return Framework.VRPEX;
    }
    return Framework.VRP;
  }

  // --- DETECÇÃO CREATIVE ---
  if (
    allContent.includes('creative.functions') ||
    allContent.includes('vRP.creative')
  ) {
    return Framework.CREATIVE;
  }

  return null;
};
