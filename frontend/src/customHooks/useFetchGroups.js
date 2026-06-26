import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setGroups } from "../../utils/groupSlice";
import { BASE_URL } from "../../utils/constants";

const useFetchGroups = () => {
    const dispatch = useDispatch();
    const [isLoading, setLoading] = useState(true);

    const fetchGroups = async () => {
        try {
            const res = await axios.get(BASE_URL + "/balance/user/groups", {withCredentials: true});
            dispatch(setGroups(res.data.groups)); 
            setLoading(false);
        } catch (error) {
            console.log("Error fetching groups!");
        }
    }

    useEffect(() => {
        fetchGroups()
    }, []);

    return {isLoading};
}

export default useFetchGroups;