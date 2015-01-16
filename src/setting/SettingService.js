// Setting Service
App.factory('SettingService', function($q, Common) {

	var db = Common.getConnection();

	return {
		getOfficeDetail: function() {
			var q = $q.defer();

			db('sys_config')
				.select('*')
				.where('sys_config_id', 1)
				.exec(function(err, rows) {
					if (err) q.reject(err);
					else q.resolve(rows[0]);
				});
			return q.promise;
		},

		doSaveOffice: function(hospcode, hospname, address) {
			var q = $q.defer();

			db('sys_config')
				.where('sys_config_id', 1)
				.update({
					hospcode: hospcode,
					hospname: hospname,
					address: address
				})
				.exec(function(err) {
					if (err) q.reject(err);
					else q.resolve();
				});

			return q.promise;
		},

		doSaveStaff: function(fullname, position, isActive) {
			var q = $q.defer();

			db('staff')
				.insert({
					fullname: fullname,
					position: position,
					is_active: isActive
				})
				.exec(function(err) {
					if (err) q.reject(err);
					else q.resolve();
				});

			return q.promise;
		},

		getStaffList: function() {
			var q = $q.defer();

			db('staff')
				.orderBy('fullname', 'desc')
				.exec(function(err, rows) {
					if (err) q.reject(err);
					else q.resolve(rows);
				});

			return q.promise;
		},

		doUpdateStaff: function(id, fullname, position, is_active) {
			var q = $q.defer();

			db('staff')
				.where('staff_id', id)
				.update({
					fullname: fullname,
					position: position,
					is_active: is_active
				})
				.exec(function(err) {
					if (err) q.reject(err);
					else q.resolve();
				});

			return q.promise;
		},

		doRemoveStaff: function(id) {
			var q = $q.defer();

			db('staff')
				.where('staff_id', id)
				.delete()
				.exec(function(err) {
					if (err) q.reject(err);
					else q.resolve();
				});

			return q.promise;
		},

		getStockList: function() {
			var q = $q.defer();

			db('sub_stock')
				.orderBy('name', 'desc')
				.exec(function(err, rows) {
					if (err) q.reject(err);
					else q.resolve(rows);
				});

			return q.promise;
		},

		doSaveStock: function(name, is_active) {
			var q = $q.defer();

			db('sub_stock')
				.insert({
					name: name,
					is_active: is_active
				})
				.exec(function(err) {
					if (err) q.reject(err);
					else q.resolve();
				});

			return q.promise;

		},

		doUpdateStock: function(id, name, is_active) {
			var q = $q.defer();

			db('sub_stock')
				.where('sub_stock_id', id)
				.update({
					name: name,
					is_active: is_active
				})
				.exec(function(err) {
					if (err) q.reject(err);
					else q.resolve();
				});

			return q.promise;
		},

		doRemoveStock: function(id) {
			var q = $q.defer();

			db('sub_stock')
				.where('sub_stock_id', id)
				.delete()
				.exec(function(err) {
					if (err) q.reject(err);
					else q.resolve();
				});

			return q.promise;
		}
	};
});
