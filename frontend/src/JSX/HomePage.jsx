import "../CSS/HomePage.css"
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { RefreshCcw } from "lucide-react";
export default function HomePage(){
  // calendar
  const [markedDates, setMarkedDates] = useState([]);
  const [value, setValue] = useState(new Date());

  const tileClassName = ({ date, view }) => {
      if (view === 'month') {
        const formatted = dayjs(date).format('YYYY-MM-DD');
        if (markedDates.includes(formatted)) {
          return 'marked';
        }
      }
      return null;
    };

    const handleClickDay = (value, event) => {
      console.log("Ngày bạn đã chọn:", value);
      // TODO: đánh dấu điểm danh ở đây
    };
    const [activedId, setActiveId] = useState(null);
    const [tables, setTables] = useState([]); // ← Lưu danh sách bàn
    const homeBtn = () => {
        window.location.reload();
    }

    const handleButtonClick = (id) => { 
        setActiveId(id);

    }

    //useState cho table
    const [selectedTable, setSelectedTable] = useState(null);
    const handleTableClick = (id) => {
        setSelectedTable(id);
        console.log(`Clicked table ${id}`);
        // Gọi API để lấy dữ liệu món ăn theo bàn
    fetch(`https://projectii-production.up.railway.app/api/order/${id}`)
    .then((res) => res.json())
    .then((data) => {
        console.log("Dữ liệu JSON trả về từ server:", data);
        setOrderedDishes(data);
    })
    .catch((err) => console.error("Lỗi khi lấy dữ liệu món ăn:", err));
    };
    
    // useEffect cho tablename
    useEffect(() => {
        fetch("https://projectii-production.up.railway.app/api/tablename") // Điều chỉnh port nếu khác
            .then((res) => res.json())
            .then((data) => setTables(data))
            .catch((err) => console.error("Lỗi khi lấy danh sách bàn:", err));
    }, []);

    // Hien thong tin mon an
    const [orderedDishes, setOrderedDishes] = useState([]);


    //Statistics
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
      if (activedId === 2) {
        fetch("https://projectii-production.up.railway.app/api/statistics/dish")
          .then((res) => res.json())
          .then((data) => {
            const formatted = data.map(item => ({
              name: item.dish_name,
              value: item.total_quantity
            }));
            setChartData(formatted);
          })
          .catch((err) => console.error("Lỗi lấy dữ liệu thống kê:", err));
      }
    }, [activedId]);

    // Bang doanh thu
    const [revenueChartData, setRevenueChartData] = useState([]);
    useEffect(() => {
      if (activedId === 2) {
        fetch("https://projectii-production.up.railway.app/api/statistics/dish")
          .then((res) => res.json())
          .then((data) => {
            const revenueData = data.map(item => ({
              name: item.dish_name,
              value: item.total_cost,
              formattedValue: new Intl.NumberFormat('vi-VN').format(item.total_quantity) + 'đ'
            })) .sort((a, b) => b.value - a.value);;
            setRevenueChartData(revenueData);
          })
          .catch((err) => console.error("Lỗi lấy dữ liệu doanh thu:", err));
      }
    }, [activedId]);
    // Lay danh sach tung thang, ngay, nam
    const [dishPeriod, setDishPeriod] = useState(); // biểu đồ số lượng
    const handleDishPeriodChange = (e) => {
      setDishPeriod(e.target.value);
    };
    useEffect(() => {
      if (activedId === 2) {
        fetch(`https://projectii-production.up.railway.app/api/statistics/dish?period=${dishPeriod}`)
          .then((res) => res.json())
          .then((data) => {
            const dishData = data.map(item => ({
              name: item.dish_name ,
              value: item.total_quantity ?? 0,
              formattedValue: new Intl.NumberFormat('vi-VN').format(item.total_quantity) + 'đ'
            })).sort((a, b) => b.value - a.value);
    
            setChartData(dishData);
          })
          .catch((err) => console.error("Lỗi lấy dữ liệu món ăn:", err));
      }
    }, [activedId, dishPeriod]);
    

    //
    //
    //
    //
    //

    const [revenuePeriod, setRevenuePeriod] = useState(); // biểu đồ doanh thu
    const handleRevenuePeriodChange = (e) => {
      setRevenuePeriod(e.target.value);
    };
    useEffect(() => {
  if (activedId === 2) {
    fetch(`https://projectii-production.up.railway.app/api/statistics/dish?period=${revenuePeriod}`)
      .then((res) => res.json())
      .then((data) => {
        const revenueData = data.map(item => ({
          name: item.dish_name,
          value: item.total_cost ?? 0,
          formattedValue: new Intl.NumberFormat('vi-VN').format(item.total_cost) + 'đ'
        })).sort((a, b) => b.value - a.value);

        setRevenueChartData(revenueData);
      })
      .catch((err) => console.error("Lỗi lấy dữ liệu doanh thu:", err));
  }
}, [activedId, revenuePeriod]);

// Lấy danh sách nhân viên
const [employees, setEmployees] = useState([]);

useEffect(() => {
  fetch("https://projectii-production.up.railway.app/api/employee")
    .then((res) => res.json())
    .then((data) => setEmployees(data))
    .catch((err) => console.error("Lỗi khi lấy danh sách nhân viên:", err));
}, []);


// Cập nhật thong tin nhân viên
const [tabType, setTabType] = useState(null); // 'update' | null
const [selectedEmployee, setSelectedEmployee] = useState(null);

const handleUpdateClick = (employee) => {
  setSelectedEmployee(employee);
  setTabType("update");
};


// Xử lý sự kiện khi nhấn nút "Cập nhật" trong tab
const [formData, setFormData] = useState({
  id_employee: "",
  employee_name: "",
  birthday: "",
  gender: "",
  phone: "",
  office_name: ""
});
useEffect(() => {
  if (selectedEmployee) {
    setFormData({
      id_employee: selectedEmployee.id_employee,
      employee_name: selectedEmployee.employee_name,
      birthday: dayjs(selectedEmployee.birthday).format("YYYY-MM-DD"),
      gender: selectedEmployee.gender,
      phone: selectedEmployee.phone,
      office_name: selectedEmployee.office_name
    });
  }
}, [selectedEmployee]);
// Xử lý cập nhật nhân viên
const handleUpdateEmployee = async () => {
  try {
    const res = await fetch("https://projectii-production.up.railway.app/api/employee/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!res.ok) throw new Error("Cập nhật thất bại");
    alert("Cập nhật thành công");

    // Cập nhật lại danh sách nhân viên
    const updatedList = await fetch("https://projectii-production.up.railway.app/api/employee").then(r => r.json());
    setEmployees(updatedList);
    setTabType(null); // Đóng tab cập nhật
  } catch (err) {
    console.error(err);
    alert("Đã xảy ra lỗi khi cập nhật nhân viên");
  }
};


const handleConfirmUpdate = () => {
  const { id_employee, employee_name, birthday, gender, phone, office_name } = formData;
  fetch(`https://projectii-production.up.railway.app/api/employee/${selectedEmployee.id_employee}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ employee_name, birthday, gender, phone, office_name }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Cập nhật thất bại");
      alert("Cập nhật thành công!");
      setTabType(null);
    })
    .catch((err) => {
      console.error(err);
      alert("Lỗi khi cập nhật nhân viên");
    });
};
    return(
    <div className="orderScreen">
        <div className="toolbar">
            <button className="btn home" onClick={()=>{homeBtn; handleButtonClick(1)}}>Home</button>
            <button className="btn goods" onClick={() => handleButtonClick(2)}>Goods</button>
            <button className="btn timesheet" onClick={() => handleButtonClick(3)}>Time Sheet</button>
            <button className="btn historyBtn" onClick={() => handleButtonClick(4)}>History</button>
            <div className="spacer"></div>
        </div>

        <div className="BHA">
            {activedId === 1 && (
                        <div className="ordertable">
                            <div className="table">
                                <div className="content">
                                <div className="table-list-container">
                                <div className="table-list">
                                    {tables.map((table) => (
                                        <div
                                            key={table.id_table}
                                            className={`table-item ${selectedTable === table.id_table ? "selected" : ""}`}
                                            onClick={() => handleTableClick(table.id_table)}
                                        >
                                            <img src={'/table.png'} alt={table.table_name} className="table-image" />
                                            <h2>{table.table_name}</h2>

                                        </div>
                                    ))}
                                </div>
                            </div>

                                    </div>
                            </div>

                        <div className="detail">
                            <div className="listOfDishes">
                            {orderedDishes.length === 0 ? (
                                <p>Chưa có món nào được đặt.</p>) : (
                                    orderedDishes.map((dish) => (
                                    <div key={dish.id_dish} className="dish-item">
                                        <img src={dish.dish_image} alt={dish.dish_name} className="dish-image" />
                                        <div className="dish-info">
                                            <h4>{dish.dish_name}</h4>
                                            <p>Số lượng: {dish.dish_quantity}</p>
                                            <p>Đơn giá: {dish.dish_cost.toLocaleString("vi-VN")}đ</p>
                                            <p>Thành tiền: {dish.total_cost.toLocaleString("vi-VN")}đ</p>
        </div>
      </div>
    ))
  )}
  <button className='pay'
  onClick={() => {
    const total = orderedDishes.reduce((sum, dish) => sum + dish.total_cost, 0);
    const formattedTotal = total.toLocaleString("vi-VN");
    // Kiểm tra nếu không có món nào được đặt
    if (orderedDishes.length === 0) {
      alert("Chưa có món nào được đặt.");
      return;
    }
    if (window.confirm(`Tổng tiền cần thanh toán: ${formattedTotal}đ\nBạn có chắc muốn thanh toán không?`)) {
      fetch(`https://projectii-production.up.railway.app/api/ordertable/delete/${selectedTable}`, {
        method: "DELETE"
      })
      .then(res => {
        if (!res.ok) throw new Error("Lỗi khi xoá order");
        alert("Thanh toán thành công!");
        // reload lại danh sách món đã đặt
        setOrderedDishes([]);
      })
      .catch(err => {
        console.error(err);
        alert("Có lỗi xảy ra khi xoá order.");
      });
    }
  }}
  
  >Thanh toán</button>
                                </div>
                        </div>
                    </div>
                )}
{activedId === 2 && (
  <div className="goodstable">
    <div className="table2">
      <div className="content2">
        <div className="stat-bag">
            <div className="stat">
            <h1 className="headerstat1">Thống kê món ăn đã bán</h1>
            <select
            className="p-2 border border-gray-300 rounded-md"
            value={dishPeriod}
            onChange={handleDishPeriodChange}>
            <option value="thismonth">Tháng này</option>
            <option value="premonth">Tháng trước</option>
            <option value="thisweek">Tuần này</option>
            <option value="thisday">Hôm nay</option>
            </select>
          <ResponsiveContainer width="100%" height="70%">
            <BarChart
              data={chartData}
              layout="vertical" // ⚠️ Quan trọng: để xoay ngang
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stat2">
            <h1 className="headerstat2">Biểu đồ doanh thu</h1>
        <select
        className="p-2 border border-gray-300 rounded-md"
        value={revenuePeriod}
        onChange={handleRevenuePeriodChange}>
            <option value="thismonth">Tháng này</option>
            <option value="premonth">Tháng trước</option>
            <option value="thisweek">Tuần này</option>
            <option value="thisday">Hôm nay</option>

  </select>
          <ResponsiveContainer width="100%" height="70%">
            <BarChart
              data={revenueChartData}
              layout="vertical" // ⚠️ Quan trọng: để xoay ngang
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number"
              tickFormatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'} />
              <YAxis type="category" dataKey="name" />
              <Tooltip
               formatter={(value) =>
                new Intl.NumberFormat('vi-VN').format(value) + 'đ'
              } />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  </div>
)}

{activedId === 3 && (
  <div className="timesheettable">
    <div className="table3">
                {/* ✅ Layout chia 2 cột: bảng + tab */}
        <div className="employee-layout">
          {/* Bảng nhân viên */}
          <div className="table-wrapper">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên nhân viên</th>
                  <th>Ngày sinh</th>
                  <th>Giới tính</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Chấm công</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id_employee}>
                    <td>{emp.id_employee}</td>
                    <td>{emp.employee_name}</td>
                    <td>{dayjs(emp.birthday).format("DD-MM-YYYY")}</td>
                    <td>{emp.gender}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.office_name}</td>
                    <td className="checkbox-cell">
                      <input
                      type="checkbox"
                      className="large-checkbox"
                      />
                      </td>
                    <td>
                      <button
                        className="update-button flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => handleUpdateClick(emp)}
                      >
                        <RefreshCcw className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="tk-btn">xác nhận</button>
          {/* Tab cập nhật */}
          {tabType === "update" && selectedEmployee && (
            <div className="tab-content-box">
              <div className="tab-header">
                <span>
                  Cập nhật nhân viên: {selectedEmployee.employee_name}
                </span>
                <button
                  onClick={() => setTabType(null)}
                  className="tab-close"
                >
                  ✕
                </button>
              </div>
              <div className="tab-body">
  <div className="form-group">
    <div className="form-label">ID:</div>
    <div className="form-value">{formData.id_employee}</div>
  </div>

  <div className="form-group">
    <label>Tên:</label>
    <input
      type="text"
      value={formData.employee_name}
      onChange={(e) =>
        setFormData({ ...formData, employee_name: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Ngày sinh:</label>
    <input
      type="date"
      value={formData.birthday}
      onChange={(e) =>
        setFormData({ ...formData, birthday: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Giới tính:</label>
    <input
      type="text"
      value={formData.gender}
      onChange={(e) =>
        setFormData({ ...formData, gender: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>SDT:</label>
    <input
      type="text"
      value={formData.phone}
      onChange={(e) =>
        setFormData({ ...formData, phone: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Công việc:</label>
    <select
      value={formData.office_name}
      onChange={(e) =>
        setFormData({ ...formData, office_name: e.target.value })
      }
    >
      <option value="Bếp">Bếp</option>
      <option value="Phục vụ">Phục vụ</option>
      <option value="Quản lý">Quản lý</option>
    </select>
  </div>
</div>
                <div className="tab-footer">
                <button
                  className="update-confirm-button"
                  onClick={handleConfirmUpdate}
                  >xác nhận</button>
                  </div>
              </div>
            
          )}
        </div>
      </div>
    </div>
)}
            {activedId === 4 && <div className="historytable">
            <div className="table4">
            </div>
        </div>
            }

        
    </div>
</div>
    )
}