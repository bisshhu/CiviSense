const reverseGeocode=async(latitude,longitude)=>{
    try {
        const response=await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
                headers:{
                    "User-Agent":"CiviSense/1.0"
                }
            }
        )
        if(!response.ok){
            throw new Error("Failed to reverse geocode location")
        }
        const data=await response.json();
        const address =data.address||{}
        return {
            address:data.display_name||"",
            area:
                address.suburb||
                address.neighbourhood||
                address.village||
                "",
            city:
                address.city ||
                address.town ||
                address.municipality ||
                "",
            district:
                address.state_district ||
                address.county ||
                "",
            state: address.state || "",
            postcode: address.postcode || "",
            latitude: Number(latitude),
            longitude: Number(longitude),
        }
    } catch (error) {
        console.error("Reverse geocoding error : ",error)
        return null 
    }
}
export {reverseGeocode}