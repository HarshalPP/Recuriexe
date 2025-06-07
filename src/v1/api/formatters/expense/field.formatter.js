export function fieldFormatter(data) {
  const {
    labelName,
    dataType,
    moduleType,
    helpText,
    isPIIData,
    restrictDuplicates,
    defaultValue,
    isMandatory,
    showInPdf,
    prefix,
    startingNumber,
    suffix,
    fileTypes,
    options,
    module,
    service,
  } = data.body;

  return {
    labelName,
    dataType,
    moduleType,
    helpText,
    isPIIData,
    restrictDuplicates,
    defaultValue,
    isMandatory,
    showInPdf,
    prefix,
    startingNumber,
    suffix,
    fileTypes,
    options,
    module,
    service,
  };
}
