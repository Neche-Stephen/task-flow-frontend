document.addEventListener("DOMContentLoaded", function() {
    const statusFilter = document.getElementById("statusFilter");
    const priorityFilter = document.getElementById("priorityFilter");
    const table = document.getElementById("taskTable");
    const rows = table.getElementsByTagName("tr");

    statusFilter.addEventListener("change", filterTable);
    priorityFilter.addEventListener("change", filterTable);

    function filterTable() {
        const statusValue = statusFilter.value.toLowerCase();
        const priorityValue = priorityFilter.value.toLowerCase();

        for (let i = 1; i < rows.length; i++) {
            const status = rows[i].cells[4].innerText.toLowerCase();
            const priority = rows[i].cells[3].innerText.toLowerCase();

            if ((statusValue === "all" || status === statusValue) && 
                (priorityValue === "all" || priority === priorityValue)) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
});
