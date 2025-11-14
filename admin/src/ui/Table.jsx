/* eslint-disable react/prop-types */
import { createContext } from "react"

const TableContext = createContext()

export default function Table({ children }) {
    return (
        <TableContext.Provider value={{}}>
            <table className="table">
                {children}
            </table>
        </TableContext.Provider>
    )
}

const Header = ({ children }) => {
    return (
        <thead className="table-header">
            {children}
        </thead>
    )
}

const Head = ({ children, className = "", ...rest }) => {
    return <th className={`table-head ${className}`} {...rest}>{children}</th>
}

const Row = ({ children, className = "", as: Component = 'tr', ...rest }) => {
    return (
        <Component className={`table-row ${className}`} {...rest}>
            {children}
        </Component>
    )
}

const Body = ({ data, render }) => {
    return <tbody className="dark:text-slate-50">{data.map(render)}</tbody>
}

const Cell = ({ children, className = '' }) => {
    return (
        <td className={`table-cell ${className}`}>
            {children}
        </td>
    )
}

Table.Header = Header
Table.Head = Head
Table.Row = Row
Table.Body = Body
Table.Cell = Cell   
