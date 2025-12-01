document.getElementById("saveAgeBtn").addEventListener("click", () => {
    const age = document.getElementById("childAgeSelect").value;

    localStorage.setItem("kidAgeGroup", age);

    document.getElementById("saveMsg").style.display = "block";

    setTimeout(() => {
        document.getElementById("saveMsg").style.display = "none";
    }, 2000);
});
