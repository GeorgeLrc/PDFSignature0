import BarLoader from 'react-spinners/BarLoader'

export default function Spinner() {
    return (
        <div className="flex items-center justify-center my-48">
            <BarLoader color='red' />
        </div>
    )
}
