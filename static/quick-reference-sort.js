(() => {
    const pagePath = "/criminal-code/quick-reference";
    const sortableHeaderSelector = "body.quick-reference-page main table th[data-sortable]";
    const collator = new Intl.Collator("tr", {
        numeric: true,
        sensitivity: "base"
    });

    const isQuickReferencePage = () => window.location.pathname.includes(pagePath);

    const preparePage = () => {
        const isQuickReference = isQuickReferencePage();
        document.body.classList.toggle("quick-reference-page", isQuickReference);

        if (!isQuickReference) return;

        document.querySelectorAll("main table").forEach((table) => {
            table.querySelectorAll("thead th").forEach((header) => {
                header.dataset.sortable = "true";
                header.tabIndex = 0;
                header.setAttribute("aria-sort", "none");
                header.title = "Sıralamak için tıklayın";
            });
        });
    };

    const getCellValue = (row, columnIndex) => {
        const text = row.cells[columnIndex]?.textContent.trim() ?? "";
        const isEmpty = text === "" || text === "-";
        const numericText = text.replace(/[^\d]/g, "");

        return {
            isEmpty,
            number: numericText ? Number(numericText) : null,
            text
        };
    };

    const compareRows = (rowA, rowB, columnIndex, direction) => {
        const valueA = getCellValue(rowA, columnIndex);
        const valueB = getCellValue(rowB, columnIndex);

        if (valueA.isEmpty !== valueB.isEmpty) {
            return valueA.isEmpty ? 1 : -1;
        }

        let comparison;
        if (valueA.number !== null && valueB.number !== null) {
            comparison = valueA.number - valueB.number;
        } else {
            comparison = collator.compare(valueA.text, valueB.text);
        }

        return direction === "asc" ? comparison : -comparison;
    };

    const sortByHeader = (header) => {
        const table = header.closest("table");
        const body = table?.tBodies[0];
        if (!table || !body) return;

        const headers = Array.from(table.tHead?.rows[0]?.cells ?? []);
        const columnIndex = headers.indexOf(header);
        if (columnIndex < 0) return;

        const direction = header.dataset.sortDirection === "desc" ? "asc" : "desc";
        const rows = Array.from(body.rows);

        headers.forEach((item) => {
            delete item.dataset.sortDirection;
            item.setAttribute("aria-sort", "none");
        });

        header.dataset.sortDirection = direction;
        header.setAttribute("aria-sort", direction === "asc" ? "ascending" : "descending");

        rows
            .sort((rowA, rowB) => compareRows(rowA, rowB, columnIndex, direction))
            .forEach((row) => body.appendChild(row));
    };

    document.addEventListener("click", (event) => {
        const header = event.target.closest(sortableHeaderSelector);
        if (header) sortByHeader(header);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;

        const header = event.target.closest(sortableHeaderSelector);
        if (!header) return;

        event.preventDefault();
        sortByHeader(header);
    });

    document.addEventListener("turbo:load", preparePage);
    document.addEventListener("DOMContentLoaded", preparePage);
})();
