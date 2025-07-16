import React from 'react';
import { IdData, DocumentType, Gender } from '../types';
import { COUNTRIES } from '../constants';

interface IdCardPreviewProps {
    data: IdData;
}

const IdCardPreview: React.FC<IdCardPreviewProps> = ({ data }) => {
    const isPassport = data.documentType === DocumentType.PASSPORT;
    const countryLabel = COUNTRIES.find(c => c.value === data.issuingCountry)?.label || data.issuingCountry;
    
    const getGenderLabel = (gender: Gender) => {
        if (gender === Gender.MALE) return 'MALE';
        if (gender === Gender.FEMALE) return 'FEMALE';
        return 'N/A';
    };

    return (
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-600">
            <div className="flex justify-between items-center border-b-2 border-teal-400/50 pb-3 mb-4">
                <h3 className="text-xl font-bold text-white">{isPassport ? 'PASSPORT' : 'IDENTITY CARD'}</h3>
                <div className="text-right">
                    <p className="font-semibold text-teal-300">{countryLabel.toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{data.issuingCountry}</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                    <img
                        src={`https://picsum.photos/seed/${data.firstName}${data.lastName}/120/150`}
                        alt="User Portrait"
                        className="w-28 h-36 rounded-lg border-2 border-gray-600 object-cover"
                    />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm flex-grow">
                    <div>
                        <p className="text-gray-400 text-xs">LAST NAME</p>
                        <p className="font-semibold text-base truncate">{data.lastName || 'DOE'}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">FIRST NAME(S)</p>
                        <p className="font-semibold text-base truncate">{data.firstName || 'JOHN'}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">NATIONALITY</p>
                        <p className="font-semibold">{data.nationality || 'UTO'}</p>
                    </div>
                     <div>
                        <p className="text-gray-400 text-xs">DOCUMENT NO.</p>
                        <p className="font-semibold font-roboto-mono tracking-wider">{data.documentNumber || 'L898902C'}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">DATE OF BIRTH</p>
                        <p className="font-semibold">{data.dateOfBirth}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">GENDER</p>
                        <p className="font-semibold">{getGenderLabel(data.gender)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">DATE OF ISSUE</p>
                        <p className="font-semibold">2020-01-01</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">DATE OF EXPIRY</p>
                        <p className="font-semibold">{data.expiryDate}</p>
                    </div>
                    {data.personalNumber && (
                         <div className="col-span-2 mt-2">
                            <p className="text-gray-400 text-xs">PERSONAL NO. / OPTIONAL DATA</p>
                            <p className="font-semibold font-roboto-mono tracking-wider">{data.personalNumber}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdCardPreview;