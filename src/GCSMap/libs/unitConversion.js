var unitType = {};
unitsHelper.getUnitTypes().forEach((t,i) => unitType[t]=i );

function isUSUnit(type) {
	return unitsHelper.getUnitSystem(unitType[type]);
}

function convert(type,value)
{
	return unitsHelper.convertToString(unitType[type],value);
}

function convertNumber(type,value)
{
	return unitsHelper.convertNumber(unitType[type],value);
}

function convertUnit(type)
{
	return unitsHelper.getUnitText(unitType[type]);
}
