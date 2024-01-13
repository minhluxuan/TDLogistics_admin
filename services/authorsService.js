const Users=require("../database/Author")

const createNewStaff = async (newStaff) =>{
    await Users.createNewStaff(newStaff);
}

const checkExistStaff = async(field , values)=>
{
  return Users.checkExistStaff(field , values);
}

const getOneStaff = async (fields, values) => {
    return await Users.getOneStaff(fields, values) ;
}

const getManyStaffs = async () => {
  return await Users.getManyStaffs() ;
}

const updateStaff = async (fields, values, conditionFields, conditionValues) =>{
  return await Users.updateStaff (fields, values, conditionFields, conditionValues) ;
}

const deleteStaff = async(staffId, agencyId)=>{
  return await Users.deleteStaff(staffId, agencyId);
}

module.exports={
    createNewStaff,
    checkExistStaff,
    getOneStaff,
    getManyStaffs,
    updateStaff,
    deleteStaff
}