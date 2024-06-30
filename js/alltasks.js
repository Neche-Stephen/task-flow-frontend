document.addEventListener('DOMContentLoaded', function() {
    const taskTableBody = document.querySelector('#taskTable tbody');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const spinner = document.getElementById('spinner'); // Spinner element
    const tableContainer = document.querySelector('.table-container'); // Table container element
    let allTasks = []; // To store all tasks fetched initially


    // Function to fetch all tasks from backend
    async function fetchTasks() {
        try {
            spinner.style.display = 'block'; // Show spinner during fetch
            const response = await fetch('http://localhost:8080/api/tasks/get-all-task', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('Token') // Assuming token is stored in localStorage
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            allTasks = await response.json();
            populateTable(allTasks); // Populate table with fetched tasks

        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert('Error fetching tasks. Please try again.');
        } finally {
            spinner.style.display = 'none'; // Hide spinner after fetch completes
            tableContainer.style.display = 'block'; // Show table container after tasks are fetched
        }
    }

    // Function to populate table with tasks
    function populateTable(tasks) {
        taskTableBody.innerHTML = ''; // Clear existing table rows

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a class="task-link" href="task-detail.html">${task.taskResponseInfo.title}</a></td>
                <td>${task.taskResponseInfo.description}</td>
                <td>${formatDate(task.taskResponseInfo.deadline)}</td>
                <td>${task.taskResponseInfo.priorityLevel}</td>
                <td>${task.taskResponseInfo.status}</td>
                <td>
                    <a href="editTask.html?taskId=${task.taskResponseInfo.id}" class="edit-btn">Edit</a>
                    <a href="javascript:void(0);" class="delete-btn">Delete</a>
                </td>
            `;
            taskTableBody.appendChild(row);

            // Attach event listener to delete button
            const deleteButton = row.querySelector('.delete-btn');
            deleteButton.addEventListener('click', () => deleteTask(task.taskResponseInfo.id));
        });
    }

    // Function to format date (assuming deadline is in ISO format)
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Event listeners for status and priority filters
    statusFilter.addEventListener('change', filterTasks);
    priorityFilter.addEventListener('change', filterTasks);

    // Function to filter tasks based on status and priority
    async function filterTasks() {
        const status = statusFilter.value;
        const priority = priorityFilter.value;

        spinner.style.display = 'block'; // Show spinner during filtering

        let filteredTasks = [];

        // Filter by status using API
        if (status !== 'all') {
            try {
                const response = await fetch(`http://localhost:8080/api/tasks/status/${status}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('Token') // Assuming token is stored in localStorage
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch tasks by status');
                }

                const tasksByStatus = await response.json();
                filteredTasks = tasksByStatus;
            } catch (error) {
                console.error('Error fetching tasks by status:', error);
                alert('Error fetching tasks by status. Please try again.');
                spinner.style.display = 'none'; // Hide spinner on error
                return;
            }
        } else {
            // Use all tasks if status filter is 'all'
            filteredTasks = allTasks;
        }

        // Filter by priority using the filteredTasks array
        if (priority !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.taskResponseInfo.priorityLevel.toUpperCase() === priority);
        }

        populateTable(filteredTasks);

        spinner.style.display = 'none'; // Hide spinner after filtering
    }

    // Function to delete a task
    async function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            spinner.style.display = 'block'; // Show spinner during delete
            try {
                const response = await fetch(`http://localhost:8080/api/tasks/delete-task/${taskId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('Token') // Assuming token is stored in localStorage
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }

                // Remove the task from the allTasks array and re-populate the table
                allTasks = allTasks.filter(task => task.taskResponseInfo.id !== taskId);
                populateTable(allTasks);

                alert('Task deleted successfully!');
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Error deleting task. Please try again.');
            } finally {
                spinner.style.display = 'none'; // Hide spinner after delete completes
            }
        }
    }

    // Initial fetch and populate tasks on page load
    fetchTasks();
});
