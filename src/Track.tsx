import { useParams } from "react-router-dom"
import { DataAccess } from "./DataAccess"
import { assertDefined } from "./func"
import { useEffect } from "react"

interface TrackProps {
    dataAccess: DataAccess
}

export const Track: React.FC<TrackProps> = _props => {
    const params = useParams()
    const trackName = assertDefined(params.track)

    useEffect(() => {

    }, [trackName])

    return <div>
        {trackName}
    </div>
}